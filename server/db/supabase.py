"""
Supabase client initialisation.
Falls back to None if credentials are missing — the API then uses in-memory storage.
"""

import os
from typing import Optional

_client = None
_initialised = False


def get_supabase():
    """Return a Supabase client, or None if not configured."""
    global _client, _initialised
    if _initialised:
        return _client

    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "") or os.getenv("SUPABASE_ANON_KEY", "")

    if url and key and "your_" not in key:
        try:
            from supabase import create_client
            _client = create_client(url, key)
            print(f"[DB] Supabase connected: {url[:40]}...")
        except Exception as e:
            print(f"[DB] Supabase init failed: {e}")
            _client = None
    else:
        print("[DB] Supabase not configured — using in-memory storage")
        _client = None

    _initialised = True
    return _client
