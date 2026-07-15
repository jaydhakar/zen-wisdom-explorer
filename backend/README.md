# Ask Thy Monk — Backend

FastAPI RAG service over a Pinecone index of ~90 Hindi Osho books. Given a
question, it embeds the question, retrieves the most relevant passages from the
namespace for the chosen language, and asks a chat model to answer — grounded
strictly in those passages, in the requested language, in 3–4 spoken-friendly
sentences. Distress/crisis questions bypass retrieval and return caring
resources instead.

The index is treated as **read-only**: this app only ever queries it.

## Requirements

- Python 3.11+ (tested target: 3.14)
- [uv](https://docs.astral.sh/uv/) for env/dependency management
- API keys for OpenAI and Pinecone, plus your Pinecone index name

## Setup

```bash
cd backend

# 1. Create your local env file and fill it in (see .env.example for every var)
cp .env.example .env        # then edit .env

# 2. Install deps into a uv-managed virtual env
uv sync
```

`.env` must contain at least `OPENAI_API_KEY`, `PINECONE_API_KEY`, and
`PINECONE_INDEX`. The model names default to `text-embedding-3-large` and
`gpt-4o-mini` but can be overridden via `EMBEDDING_MODEL` / `CHAT_MODEL`.

> The embedding model **must** match the one your index was built with
> (`text-embedding-3-large`, 3072 dims) or similarity search will silently
> return garbage.

## Run locally

```bash
# From the backend/ directory
uv run uvicorn app.main:app --reload --port 8000
```

The server listens on `http://localhost:8000`.

## Endpoints & curl tests

### 1. Health check

```bash
curl http://localhost:8000/health
```

Expected:

```json
{"status":"ok"}
```

### 2. Supported languages

The mobile app reads this to populate its language toggle — it never hardcodes
the options. Today it returns only Hindi.

```bash
curl http://localhost:8000/api/languages
```

Expected (with the default `SUPPORTED_LANGUAGES=["hi"]`):

```json
{"languages":[{"code":"hi","label":"Hindi"}]}
```

### 3. Ask wisdom (Hindi — the populated corpus)

`language` defaults to `"hi"` if omitted.

```bash
curl -X POST http://localhost:8000/api/wisdom \
  -H "Content-Type: application/json" \
  -d '{"question": "मन को शांत कैसे करें?", "language": "hi"}'
```

Expected shape (actual text depends on your index):

```json
{"answer":"...", "book":"...", "language":"hi"}
```

If nothing relevant is retrieved, `answer` is exactly:
`"I have not spoken on this specific matter in the indexed literature."` and
`book` is `null`.

### 4. Ask wisdom in English (paraphrased from the Hindi sources)

```bash
curl -X POST http://localhost:8000/api/wisdom \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I quiet my mind?", "language": "hi"}'
```

Note: send `"language":"hi"` to search the Hindi corpus but you can also ask the
question in English — retrieval is by meaning. The **`en`** language searches the
(currently empty) `en` namespace and will gracefully return the "not indexed"
fallback until English books are added.

### 5. Empty namespace fallback (English namespace, empty today)

```bash
curl -X POST http://localhost:8000/api/wisdom \
  -H "Content-Type: application/json" \
  -d '{"question": "What is meditation?", "language": "en"}'
```

> Only works if `en` is in `SUPPORTED_LANGUAGES`; otherwise the server treats the
> request as the default language. Expected when `en` is empty:

```json
{"answer":"I have not spoken on this specific matter in the indexed literature.","book":null,"language":"en"}
```

### 6. Crisis / distress path (no API calls, no RAG)

```bash
curl -X POST http://localhost:8000/api/wisdom \
  -H "Content-Type: application/json" \
  -d '{"question": "I want to end my life", "language": "en"}'
```

Returns a direct, caring message with crisis helpline resources and `book:null`.
This path never touches OpenAI or Pinecone, so it works even without API keys.

## Configuration reference

| Env var | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | — | OpenAI auth, shared by both languages (required) |
| `CHAT_MODEL` | `gpt-4o-mini` | Answer generation model |
| `PINECONE_API_KEY` | — | **Hindi** Pinecone account auth (required) |
| `PINECONE_INDEX` | — | **Hindi** index name (required) |
| `EMBEDDING_MODEL` | `text-embedding-3-large` | **Hindi** query embedding model (3072-dim) |
| `PINECONE_API_KEY_EN` | — | **English** Pinecone account auth (separate account) |
| `PINECONE_INDEX_EN` | `askthymonk-en` | **English** index name |
| `EMBEDDING_MODEL_EN` | `text-embedding-3-small` | **English** query embedding model (1536-dim) |
| `SUPPORTED_LANGUAGES` | `["hi"]` | Languages the app may offer |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |
| `RATE_LIMIT` | `20/minute` | Per-IP limit on `/api/wisdom` |
| `TOP_K` | `3` | Chunks retrieved per query (Hindi) |
| `TOP_K_EN` | `6` | Chunks retrieved per query (English — higher; `-3-small` returns more diffuse passages) |
| `API_SHARED_SECRET` | *(empty)* | If set, `/api/wisdom` requires a matching `X-API-Key` header |

## Tests

```bash
uv run pytest
```

Covers the crisis/distress matcher (both languages, transliteration, nukta
spelling variants, and the exact phrase that once slipped through) plus the
crisis routing and the `X-API-Key` gate — all offline, no API keys needed.

## Optional: shared-secret gate

Set `API_SHARED_SECRET` (and the matching `EXPO_PUBLIC_API_KEY` in `mobile/.env`)
to require an `X-API-Key` header on `/api/wisdom`. Empty by default (open, for
local dev). This deters casual direct hits on a deployed URL, but note that a
secret shipped inside a public mobile app is extractable — it is not a
substitute for real authentication.

## How language maps to retrieval

Hindi and English are stored in **two separate Pinecone accounts** — done to use
each account's free 2GB tier rather than paying for Pinecone Standard while the
app is pre-commercial. Each language therefore has its own account/index **and**
its own embedding model + dimension. The request flow embeds first, then queries,
so the language selects the embedding model **and** the matching index as one
pair (`RetrievalTarget`) — they are never mixed.

| `language` | Embedding model | Pinecone account / index | Namespace | Contents |
|---|---|---|---|---|
| `hi` | `text-embedding-3-large` (3072-dim) | original account / `PINECONE_INDEX` | default | ~75k Hindi vectors |
| `en` | `text-embedding-3-small` (1536-dim) | separate account / `askthymonk-en` | default | 2,607 English vectors |

> Pairing the wrong model with the wrong index (e.g. a 1536-dim English embedding
> against the 3072-dim Hindi index) fails with a **dimension-mismatch** error —
> which is why the model and index are resolved together, per language.
