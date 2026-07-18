// ClinicalTrials.gov API v2 mapping helpers shared by the /api/trials
// routes. Studies map onto the frontend Trial type with live:true so the
// UI can label externally sourced trials truthfully.

import type { Trial } from "@/types";

export const CTGOV_BASE = "https://clinicaltrials.gov/api/v2/studies";

export const SEARCH_FIELDS = [
  "protocolSection.identificationModule.nctId",
  "protocolSection.identificationModule.briefTitle",
  "protocolSection.statusModule.overallStatus",
  "protocolSection.designModule.phases",
  "protocolSection.designModule.enrollmentInfo",
  "protocolSection.sponsorCollaboratorsModule.leadSponsor",
  "protocolSection.conditionsModule.conditions",
  "protocolSection.contactsLocationsModule.locations.country",
].join(",");

export interface CtgovStudy {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string };
    statusModule?: { overallStatus?: string };
    designModule?: {
      phases?: string[];
      enrollmentInfo?: { count?: number };
    };
    sponsorCollaboratorsModule?: { leadSponsor?: { name?: string } };
    conditionsModule?: { conditions?: string[] };
    contactsLocationsModule?: { locations?: { country?: string }[] };
    eligibilityModule?: { eligibilityCriteria?: string };
    descriptionModule?: { briefSummary?: string };
  };
}

function formatPhases(phases?: string[]): string {
  if (!phases?.length || phases[0] === "NA") return "N/A";
  const nums = phases
    .map((p) => p.replace("EARLY_PHASE", "Early ").replace("PHASE", ""))
    .join("/");
  return `Phase ${nums}`;
}

function titleCase(s?: string): string {
  if (!s) return "Unknown";
  return s
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function mapStudy(s: CtgovStudy): Trial | null {
  const ps = s.protocolSection;
  if (!ps?.identificationModule?.nctId) return null;
  const countries = [
    ...new Set(
      (ps.contactsLocationsModule?.locations ?? [])
        .map((l) => l.country)
        .filter((c): c is string => Boolean(c)),
    ),
  ];
  const count = ps.designModule?.enrollmentInfo?.count;
  return {
    id: ps.identificationModule.nctId,
    title: ps.identificationModule.briefTitle ?? ps.identificationModule.nctId,
    sponsor: ps.sponsorCollaboratorsModule?.leadSponsor?.name ?? "Unknown",
    status: titleCase(ps.statusModule?.overallStatus),
    phase: formatPhases(ps.designModule?.phases),
    location:
      countries.length === 0
        ? "See ClinicalTrials.gov"
        : countries.length === 1
          ? countries[0]
          : `${countries[0]} +${countries.length - 1} more`,
    enrollment: count != null ? `Est. ${count} participants` : "Not stated",
    conditions: (ps.conditionsModule?.conditions ?? []).slice(0, 3),
    live: true,
  };
}
