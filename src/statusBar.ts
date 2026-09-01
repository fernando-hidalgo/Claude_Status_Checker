import * as vscode from "vscode";
import { formatUpdatedAt, type StatusSummary } from "./api";

const LABEL = "Claude";

export class ServiceStatusBar implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(
      "claudeStatus.item",
      vscode.StatusBarAlignment.Right,
      Number.MIN_SAFE_INTEGER + 3
    );
    this.item.command = "claudeStatus.openStatus";
    this.item.show();
  }

  setLoading(): void {
    this.item.text = `$(sync~spin) ${LABEL}`;
    this.item.backgroundColor = undefined;
    this.item.tooltip = "Checking Claude status…";
  }

  setStatus(summary: StatusSummary): void {
    const suffix =
      summary.severity === "error"
        ? " · Outage"
        : summary.severity === "warn"
          ? " · Degraded"
          : "";
    const icon =
      summary.severity === "error"
        ? "$(error)"
        : summary.severity === "warn"
          ? "$(warning)"
          : "$(pass)";

    this.item.text = `${icon} ${LABEL}${suffix}`;
    this.item.backgroundColor =
      summary.severity === "error"
        ? new vscode.ThemeColor("statusBarItem.errorBackground")
        : summary.severity === "warn"
          ? new vscode.ThemeColor("statusBarItem.warningBackground")
          : undefined;
    this.item.tooltip = buildTooltip(summary);
  }

  setError(message: string): void {
    this.item.text = `$(warning) ${LABEL} · ?`;
    this.item.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.errorBackground"
    );
    this.item.tooltip = `${message}\nUse command: Claude Status: Refresh`;
  }

  dispose(): void {
    this.item.dispose();
  }
}

function buildTooltip(summary: StatusSummary): string {
  const lines = [summary.description];

  if (summary.activeIncident) {
    lines.push(`Incident: ${summary.activeIncident}`);
  }

  lines.push("");
  lines.push(`Updated: ${formatUpdatedAt(summary.updatedAt)}`);
  return lines.join("\n");
}
