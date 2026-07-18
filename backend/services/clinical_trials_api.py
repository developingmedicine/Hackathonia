"""
Trial service: fetch from ClinicalTrials.gov API v2, normalize to the §19
trial object, cache selected trials locally so judging never depends on
live CT.gov availability (§38).
"""
