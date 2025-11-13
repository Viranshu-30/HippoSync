import requests
from typing import Dict, Any, Optional
from .config import settings

BASE = settings.memmachine_base_url.rstrip("/")

def _session_payload(group_scope: str, user_id: str, session_id: Optional[str]) -> Dict[str, Any]:
    sid = session_id or f"sess-{user_id}"
    return {
        "group_id": f"{settings.memmachine_group_prefix}-{group_scope}",
        "agent_id": [settings.memmachine_agent_id],
        "user_id": [user_id],
        "session_id": sid,
    }

def search(group_scope: str, user_id: str, query: str, limit: int = 8, session_id: Optional[str] = None) -> Dict[str, Any]:
    payload = {
        "session": _session_payload(group_scope, user_id, session_id),
        "query": query or "",
        "filter": {},
        "limit": limit,
    }
    r = requests.post(f"{BASE}/v1/memories/search", json=payload, timeout=60)
    r.raise_for_status()
    return r.json()

def add_episodic(group_scope: str, user_id: str, text: str, episode_type: str = "chat",
                 metadata: Optional[Dict[str, Any]] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
    payload = {
        "session": _session_payload(group_scope, user_id, session_id),
        "producer": settings.memmachine_agent_id,
        "produced_for": user_id,
        "episode_content": text,
        "episode_type": episode_type,
        "metadata": metadata or {},
    }
    r = requests.post(f"{BASE}/v1/memories/episodic", json=payload, timeout=60)
    r.raise_for_status()
    return r.json()

def add_profile(group_scope: str, user_id: str, text: str, episode_type: str = "fact",
                metadata: Optional[Dict[str, Any]] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
    payload = {
        "session": _session_payload(group_scope, user_id, session_id),
        "producer": settings.memmachine_agent_id,
        "produced_for": user_id,
        "episode_content": text,
        "episode_type": episode_type,
        "metadata": metadata or {},
    }
    r = requests.post(f"{BASE}/v1/memories/profile", json=payload, timeout=60)
    r.raise_for_status()
    return r.json()
