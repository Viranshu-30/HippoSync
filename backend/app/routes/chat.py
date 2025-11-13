from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Any
import tempfile, os
from uuid import uuid4

from sqlalchemy.orm import Session
from openai import OpenAI

from ..auth import get_current_user, get_db
from ..config import settings
from ..schemas import ChatResponse
from ..models import Thread, ProjectMember, Message
from ..memmachine_client import search as mm_search, add_episodic, add_profile
from ..utils.parser import sniff_and_read
from ..utils.memory import chunk_text

router = APIRouter(prefix="/chat", tags=["chat"])


def _ensure_access(thread: Thread, user_id: int, db: Session):
    """Check whether the current user can access this chat thread."""
    if thread.project_id:
        member = (
            db.query(ProjectMember)
            .filter_by(project_id=thread.project_id, user_id=user_id)
            .first()
        )
        if not member:
            raise HTTPException(status_code=403, detail="No access to this project chat")
    elif thread.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No access to this personal chat")


@router.post("/", response_model=ChatResponse)
def chat(
    thread_id: int = Form(...),
    message: str = Form(""),
    file: UploadFile | None = File(None),
    model: str = Form("gpt-4o-mini"),
    temperature: float = Form(1.0),
    system_prompt: str = Form(""),
    user: Any = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Main chat endpoint — auto-creates a personal thread for regular users if missing."""

    # 1️⃣ Try to get the thread
    thread = db.get(Thread, thread_id)

    # 2️⃣ If thread doesn't exist, create a personal one
    if not thread:
        group_scope = f"user-{user.id}"
        thread = Thread(
            title="Personal Chat",
            owner_user_id=user.id,
            project_id=None,
            session_id=f"t-{uuid4().hex[:12]}",
            group_scope=group_scope,
        )
        db.add(thread)
        db.commit()
        db.refresh(thread)

    # 3️⃣ Verify access
    _ensure_access(thread, user.id, db)

    uid = str(user.id)
    group_scope = thread.group_scope
    session_id = thread.session_id

    parsed_text = ""
    reply = ""

    # 4️⃣ Handle file uploads
    if file:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name
        try:
            parsed_text, kind = sniff_and_read(tmp_path, file.filename)
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass

        db.add(Message(thread_id=thread.id, sender="user", type="file", filename=file.filename))
        db.commit()

        if parsed_text.strip():
            chunks = chunk_text(parsed_text, chunk_size=1200, overlap=150)
            for i, ch in enumerate(chunks[:24]):
                add_episodic(
                    group_scope,
                    uid,
                    ch,
                    episode_type="document_chunk",
                    metadata={"source": file.filename, "part": i, "kind": kind, "thread_id": thread.id},
                    session_id=session_id,
                )

            add_episodic(
                group_scope,
                uid,
                f"Document uploaded: {file.filename} ({len(chunks)} chunks).",
                episode_type="document",
                metadata={"kind": kind, "thread_id": thread.id},
                session_id=session_id,
            )
            add_profile(
                group_scope,
                uid,
                f"Stored document: {file.filename}",
                episode_type="document",
                metadata={"filename": file.filename, "kind": kind, "thread_id": thread.id},
                session_id=session_id,
            )

            if not message.strip():
                message = f"Please summarize this document:\n{parsed_text[:4000]}"

    # 5️⃣ Save user message
    if message.strip():
        db.add(Message(thread_id=thread.id, sender="user", type="text", content=message))
        db.commit()

    # 6️⃣ Recall context from MemMachine
    recall_query = message or "recent context and uploaded documents"
    content = mm_search(group_scope, uid, recall_query, limit=12, session_id=session_id)
    episodic = content.get("episodic_results", []) or []
    profile = content.get("profile_results", []) or []
    context_blobs = [m.get("episode_content", "") for m in (episodic + profile)]
    if parsed_text:
        context_blobs.insert(0, parsed_text[:4000])
    context_text = "\n\n".join(context_blobs[:10])

    # 7️⃣ Build prompt for OpenAI
    msgs = []
    if system_prompt:
        msgs.append({"role": "system", "content": system_prompt})
    if context_text:
        msgs.append({"role": "system", "content": f"Relevant memory context:\n{context_text}"})
    if message.strip():
        msgs.append({"role": "user", "content": message})
    elif file:
        msgs.append({"role": "user", "content": f"Analyze the uploaded file {file.filename}."})
    else:
        msgs.append({"role": "user", "content": "Hi!"})

    # 8️⃣ Query model
    client = OpenAI(api_key=settings.openai_api_key or os.getenv("OPENAI_API_KEY"))
    try:
        resp = client.chat.completions.create(model=model, messages=msgs, temperature=temperature)
        reply = resp.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {e}")

    # 9️⃣ Store assistant reply
    db.add(Message(thread_id=thread.id, sender="assistant", type="text", content=reply))
    db.commit()

    add_episodic(
        group_scope,
        uid,
        f"User: {message}\nAssistant: {reply}",
        episode_type="chat",
        metadata={"model": model, "thread_id": thread.id},
        session_id=session_id,
    )

    add_profile(
        group_scope, uid, f"Assistant reply: {reply}",
        episode_type="assistant_fact",
        metadata={"model": model, "thread_id": thread.id, "source": "assistant"},
        session_id=session_id,  
    )
    return JSONResponse(content={"reply": reply, "thread_id": thread.id, "used_context": context_blobs[:8]})
