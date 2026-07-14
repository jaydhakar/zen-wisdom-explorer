"""The embedding model and Pinecone account/index must be resolved together per
language, never mixed. These are pure/offline (no API calls)."""

from app import config


def _set_targets(monkeypatch):
    s = config.get_settings()
    monkeypatch.setattr(s, "embedding_model", "hi-large")
    monkeypatch.setattr(s, "pinecone_api_key", "HI_KEY")
    monkeypatch.setattr(s, "pinecone_index", "hindi-index")
    monkeypatch.setattr(s, "embedding_model_en", "en-small")
    monkeypatch.setattr(s, "pinecone_api_key_en", "EN_KEY")
    monkeypatch.setattr(s, "pinecone_index_en", "askthymonk-en")


def test_hindi_target_is_self_consistent(monkeypatch):
    _set_targets(monkeypatch)
    t = config.retrieval_target("hi")
    assert (t.embedding_model, t.pinecone_api_key, t.pinecone_index) == (
        "hi-large",
        "HI_KEY",
        "hindi-index",
    )


def test_english_target_is_self_consistent(monkeypatch):
    _set_targets(monkeypatch)
    t = config.retrieval_target("en")
    assert (t.embedding_model, t.pinecone_api_key, t.pinecone_index) == (
        "en-small",
        "EN_KEY",
        "askthymonk-en",
    )


def test_no_cross_language_mixing(monkeypatch):
    _set_targets(monkeypatch)
    hi = config.retrieval_target("hi")
    en = config.retrieval_target("en")
    # The English model must never travel with the Hindi index, or vice versa.
    assert hi.embedding_model != en.embedding_model
    assert hi.pinecone_api_key != en.pinecone_api_key
    assert hi.pinecone_index != en.pinecone_index


def test_unknown_language_falls_back_to_hindi(monkeypatch):
    _set_targets(monkeypatch)
    t = config.retrieval_target("xx")
    assert t.language == "hi"
    assert t.pinecone_index == "hindi-index"
