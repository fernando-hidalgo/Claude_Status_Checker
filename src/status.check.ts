import { formatUpdatedAt, parseSummary } from "./api";

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    throw new Error(msg);
  }
}

const allOk = parseSummary({
  page: { updated_at: "2026-08-25T21:00:00.000Z" },
  status: { indicator: "none", description: "All Systems Operational" },
  components: [
    { name: "claude.ai", status: "operational" },
    { name: "Claude API (api.anthropic.com)", status: "operational" },
  ],
  incidents: [],
});

assert(allOk.severity === "ok", "all operational → ok");
assert(allOk.affected.length === 0, "no affected components");

const major = parseSummary({
  page: { updated_at: "2026-08-25T21:00:00.000Z" },
  status: { indicator: "none", description: "Partial System Outage" },
  components: [
    { name: "Claude API (api.anthropic.com)", status: "major_outage" },
    { name: "Claude Code", status: "operational" },
  ],
  incidents: [],
});

assert(major.severity === "error", "major_outage component → error");
assert(major.affected.length === 1, "one affected component");

const degraded = parseSummary({
  page: { updated_at: "2026-08-25T21:00:00.000Z" },
  status: { indicator: "minor", description: "Degraded Performance" },
  components: [
    { name: "Claude Code", status: "degraded_performance" },
    { name: "claude.ai", status: "partial_outage" },
  ],
  incidents: [],
});

assert(degraded.severity === "warn", "degraded components → warn");
assert(degraded.affected.length === 2, "two affected");

const incidentOnly = parseSummary({
  page: { updated_at: "2026-08-25T21:00:00.000Z" },
  status: { indicator: "none", description: "All Systems Operational" },
  components: [{ name: "claude.ai", status: "operational" }],
  incidents: [{ name: "Elevated errors for multiple models", impact: "minor" }],
});

assert(incidentOnly.severity === "warn", "active incident → warn");
assert(
  incidentOnly.activeIncident === "Elevated errors for multiple models",
  "incident name captured"
);

const critical = parseSummary({
  page: { updated_at: "2026-08-25T21:00:00.000Z" },
  status: { indicator: "critical", description: "Major Outage" },
  components: [],
  incidents: [],
});

assert(critical.severity === "error", "critical indicator → error");

const formatted = formatUpdatedAt("2026-08-25T21:00:00.000Z");
assert(typeof formatted === "string" && formatted.length > 0, "date formats");

console.log("status.check: ok");
