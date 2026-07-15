"""Minimal in-memory engagement metrics.

We store NO raw question/answer text (matching our retention approach) — only
counts, so we can tell whether conversational memory increases engagement:
how many conversations reach 2+ turns, and the average turns per conversation.

In-memory only (resets on restart / is per-instance). That's fine for an early
engagement test; the per-request log line also lets us aggregate from logs if a
restart wipes the counters.
"""

from __future__ import annotations

import logging

logger = logging.getLogger("askthymonk.metrics")

_stats = {"requests": 0, "conversations": 0, "reached_2plus": 0}


def record_turn(turn: int) -> None:
    """Record one /api/wisdom request. `turn` is 1 for a fresh conversation,
    2 for the first follow-up, etc. (i.e. len(conversation_history) + 1)."""
    _stats["requests"] += 1
    if turn <= 1:
        _stats["conversations"] += 1
    if turn == 2:
        # Counted once per conversation, the moment it first becomes multi-turn.
        _stats["reached_2plus"] += 1

    conversations = _stats["conversations"] or 1
    logger.info(
        "engagement turn=%d conversations=%d reached_2plus=%d pct_2plus=%.1f avg_turns=%.2f",
        turn,
        _stats["conversations"],
        _stats["reached_2plus"],
        100.0 * _stats["reached_2plus"] / conversations,
        _stats["requests"] / conversations,
    )
