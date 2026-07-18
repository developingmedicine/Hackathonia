"""
Single wrapper for all Claude API calls: structured-JSON outputs only (§31),
shared safeguards (preserve source text, distinguish extraction vs inference,
confidence + human-review flags, no diagnostic/eligibility overclaiming).
Model selection is an open decision (§42).
"""
