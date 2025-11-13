
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from typing import List, Dict, Any

from ..config import settings
from ..auth import get_current_user

router = APIRouter(prefix="/models", tags=["models"])

@router.get("", response_model=List[str])
def list_models(_: Any = Depends(get_current_user)) -> List[str]:
    # Try to list models dynamically; fallback to a curated list.
    client = OpenAI(api_key=settings.openai_api_key)
    try:
        remote = client.models.list()
        ids = [m.id for m in remote.data]
        # Keep likely chat-capable OpenAI models
        allow = [m for m in ids if any(k in m for k in ["gpt-4o", "gpt-4.1", "gpt-4", "o3", "o4", "gpt-3.5"])]
        # Deduplicate and sort
        return sorted(list(set(allow)))
    except Exception:
        # Fallback: safe defaults you likely have access to
        return ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"]
