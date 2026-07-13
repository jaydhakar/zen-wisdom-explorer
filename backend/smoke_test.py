"""Encoding-safe smoke test for a running Ask Thy Monk backend.

Windows PowerShell 5.1 mangles Devanagari on both stdin and stdout, which makes
curl/Invoke-RestMethod an unreliable way to test the Hindi paths. This script
sources its Hindi text from this (UTF-8) file and prints with UTF-8 stdout, so
what you see is exactly what the server received and returned.

It talks to the already-running server over HTTP, so it needs no API keys of its
own. Uses only the Python standard library.

Usage (with the server running on port 8000):
    python smoke_test.py
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

try:
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
except Exception:
    pass

BASE = "http://localhost:8000"


def _get(path: str):
    with urllib.request.urlopen(BASE + path, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _post_wisdom(question: str, language: str = "hi"):
    body = json.dumps({"question": question, "language": language}).encode("utf-8")
    req = urllib.request.Request(
        BASE + "/api/wisdom",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return {"_http_status": exc.code, "body": exc.read().decode("utf-8")}


def _show(label: str, obj) -> None:
    print("=" * 72)
    print(label)
    print(json.dumps(obj, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    _show("GET /health", _get("/health"))
    _show("GET /api/languages", _get("/api/languages"))
    _show(
        "POST /api/wisdom — Hindi question, hi (the real retrieval test)",
        _post_wisdom("मन को शांत कैसे करें?", "hi"),
    )
    _show(
        "POST /api/wisdom — English question against Hindi corpus, hi",
        _post_wisdom("How do I quiet my mind?", "hi"),
    )
    _show(
        "POST /api/wisdom — crisis path, hi (should return helplines, book=null)",
        _post_wisdom("मैं अपनी ज़िंदगी खत्म करना चाहता हूँ", "hi"),
    )
    print("=" * 72)
