from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import uuid4

from ..auth import get_current_user, get_db
from ..models import Thread, ProjectMember, Message
from ..schemas import ThreadCreate, ThreadOut, MessageOut

router = APIRouter(prefix="/threads", tags=["threads"])

def _ensure_access(thread: Thread, user_id: int, db: Session):
    """Check if user has access to this thread."""
    if thread.project_id:
        mem = (
            db.query(ProjectMember)
            .filter_by(project_id=thread.project_id, user_id=user_id)
            .first()
        )
        if not mem:
            raise HTTPException(status_code=403, detail="No access to this project thread")
    else:
        if thread.owner_user_id != user_id:
            raise HTTPException(status_code=403, detail="No access to this personal thread")


@router.post("", response_model=ThreadOut)
def create_thread(payload: ThreadCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new personal or project thread."""
    if payload.project_id:
        mem = (
            db.query(ProjectMember)
            .filter_by(project_id=payload.project_id, user_id=user.id)
            .first()
        )
        if not mem:
            raise HTTPException(status_code=403, detail="Not a project member")
        group_scope = f"project-{payload.project_id}"
    else:
        group_scope = f"user-{user.id}"

    t = Thread(
        title=payload.title or "New chat",
        owner_user_id=user.id,
        project_id=payload.project_id,
        session_id=f"t-{uuid4().hex[:12]}",
        group_scope=group_scope,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.get("", response_model=List[ThreadOut])
def list_threads(
    project_id: Optional[int] = Query(None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List threads for personal or project scope."""
    q = db.query(Thread)
    if project_id is None:
        q = q.filter(Thread.project_id == None, Thread.owner_user_id == user.id)
    else:
        mem = (
            db.query(ProjectMember)
            .filter_by(project_id=project_id, user_id=user.id)
            .first()
        )
        if not mem:
            raise HTTPException(status_code=403, detail="Not a project member")
        q = q.filter(Thread.project_id == project_id)
    return q.order_by(Thread.last_message_at.desc()).all()


@router.get("/{thread_id}/messages", response_model=List[MessageOut])
def get_messages(thread_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch messages for a thread."""
    thread = db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    _ensure_access(thread, user.id, db)
    msgs = (
        db.query(Message)
        .filter_by(thread_id=thread_id)
        .order_by(Message.created_at.asc())
        .limit(500)
        .all()
    )
    return msgs


@router.put("/{thread_id}")
def rename_thread(thread_id: int, payload: dict, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Rename a chat thread."""
    t = db.get(Thread, thread_id)
    if not t:
        raise HTTPException(status_code=404, detail="Thread not found")
    if t.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your chat")
    t.title = payload.get("title", t.title)
    db.commit()
    return {"status": "renamed", "title": t.title}


@router.delete("/{thread_id}")
def delete_thread(thread_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a chat thread and its messages."""
    t = db.get(Thread, thread_id)
    if not t:
        raise HTTPException(status_code=404, detail="Thread not found")
    if t.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your chat")
    db.delete(t)
    db.commit()
    return {"status": "deleted"}
