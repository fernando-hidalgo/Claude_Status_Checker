export type ComponentStatus =
  | "operational"
  | "degraded_performance"
  | "partial_outage"
  | "major_outage"
  | "under_maintenance";

export type Severity = "ok" | "warn" | "error";

export interface AffectedComponent {
  name: string;
  status: ComponentStatus;
}

export interface StatusSummary {
  description: string;
  severity: Severity;
  affected: AffectedComponent[];
  activeIncident?: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<ComponentStatus, string> = {
  operational: "Operational",
  degraded_performance: "Degraded Performance",
  partial_outage: "Partial Outage",
  major_outage: "Major Outage",
  under_maintenance: "Under Maintenance",
};

export const API_URL = "https://status.claude.com/api/v2/summary.json";

export const STATUS_PAGE_URL = "https://status.claude.com/";

export function componentStatusLabel(status: ComponentStatus): string {
  return STATUS_LABELS[status];
}

export function parseSummary(raw: unknown): StatusSummary {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid status response");
  }

  const data = raw as Record<string, unknown>;
  const page = data.page as Record<string, unknown> | undefined;
  const status = data.status as Record<string, unknown> | undefined;
  const components = Array.isArray(data.components) ? data.components : [];
  const incidents = Array.isArray(data.incidents) ? data.incidents : [];

  const description =
    typeof status?.description === "string"
      ? status.description
      : "Unknown status";

  const indicator =
    typeof status?.indicator === "string" ? status.indicator : "none";

  const affected: AffectedComponent[] = [];
  for (const item of components) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const comp = item as Record<string, unknown>;
    const name = typeof comp.name === "string" ? comp.name : "";
    const compStatus = comp.status as ComponentStatus;
    if (!name || compStatus === "operational") {
      continue;
    }
    affected.push({ name, status: compStatus });
  }

  let activeIncident: string | undefined;
  for (const item of incidents) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const inc = item as Record<string, unknown>;
    const impact = typeof inc.impact === "string" ? inc.impact : "none";
    const name = typeof inc.name === "string" ? inc.name : "";
    if (impact !== "none" && name) {
      activeIncident = name;
      break;
    }
  }

  const severity = computeSeverity(indicator, affected, activeIncident);
  const updatedAt =
    typeof page?.updated_at === "string" ? page.updated_at : "";

  return {
    description,
    severity,
    affected,
    activeIncident,
    updatedAt,
  };
}

function computeSeverity(
  indicator: string,
  affected: AffectedComponent[],
  activeIncident?: string
): Severity {
  if (indicator === "critical" || indicator === "major") {
    return "error";
  }
  if (affected.some((c) => c.status === "major_outage")) {
    return "error";
  }
  if (indicator === "minor") {
    return "warn";
  }
  if (
    affected.some(
      (c) =>
        c.status === "degraded_performance" ||
        c.status === "partial_outage" ||
        c.status === "under_maintenance"
    )
  ) {
    return "warn";
  }
  if (activeIncident) {
    return "warn";
  }
  return "ok";
}

export async function fetchStatusSummary(): Promise<StatusSummary> {
  const res = await fetch(API_URL, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return parseSummary(await res.json());
}

export function formatUpdatedAt(iso: string): string {
  if (!iso) {
    return "Unknown";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
