from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any

# -------- Auth ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# -------- Chat ----------
class ChatResponse(BaseModel):
    reply: str
    used_context: List[Any] = []

# -------- Projects & Threads ----------
class ProjectCreate(BaseModel):
    name: str

class ProjectOut(BaseModel):
    id: int
    name: str
    owner_id: int
    class Config:
        from_attributes = True

class InviteMember(BaseModel):
    email: EmailStr
    role: Optional[str] = "member"

class ThreadCreate(BaseModel):
    title: Optional[str] = "New chat"
    project_id: Optional[int] = None  # null -> personal thread

class ThreadOut(BaseModel):
    id: int
    title: str
    project_id: Optional[int] = None
    session_id: str
    group_scope: str
    class Config:
        from_attributes = True

class MessageOut(BaseModel):
    id: int
    thread_id: int
    sender: str
    content: Optional[str] = None
    type: str
    filename: Optional[str] = None
    class Config:
        from_attributes = True
