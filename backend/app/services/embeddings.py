"""Question embedding via OpenAI.

The embedding model MUST match the one used to build the target Pinecone index,
or similarity search breaks (and, across our two indexes of different
dimensions, a query fails outright). The model is passed in by the caller from
the language's RetrievalTarget so the model and index always belong together.

Both languages use the same OpenAI key, so a single OpenAI client serves both;
only the model name differs per call.
"""

from __future__ import annotations

from functools import lru_cache

from openai import OpenAI

from ..config import get_settings


@lru_cache
def _client() -> OpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    return OpenAI(api_key=settings.openai_api_key)


def embed_question(text: str, model: str) -> list[float]:
    response = _client().embeddings.create(model=model, input=text)
    return response.data[0].embedding
