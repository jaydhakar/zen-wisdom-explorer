"""Pydantic request/response schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field

from .config import DEFAULT_LANGUAGE

# Hard cap on how many prior turns we accept, enforced server-side regardless of
# what the client sends.
MAX_HISTORY_TURNS = 4


class QAPair(BaseModel):
    question: str
    answer: str


class WisdomRequest(BaseModel):
    question: str = Field(..., min_length=1, description="The user's question.")
    # Defaults to "hi" when the client omits it.
    language: str = DEFAULT_LANGUAGE
    # Optional recent conversation turns (oldest first) for follow-up context.
    # Only the last MAX_HISTORY_TURNS are used; enforced in the endpoint.
    conversation_history: list[QAPair] = Field(default_factory=list)


class WisdomResponse(BaseModel):
    answer: str
    book: str | None = None
    language: str


class LanguageInfo(BaseModel):
    code: str
    label: str


class LanguagesResponse(BaseModel):
    languages: list[LanguageInfo]
