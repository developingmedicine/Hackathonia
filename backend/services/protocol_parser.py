"""
Protocol parser: split eligibility_text into inclusion/exclusion criteria,
normalize, classify evaluation_mode, identify required patient data fields
and time windows. Claude-backed with structured JSON output (§31).
Primary demo trial criteria are manually reviewed and cached (§37).
"""
