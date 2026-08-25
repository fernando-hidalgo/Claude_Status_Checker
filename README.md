# Claude Status

Cursor/VS Code extension that shows [Claude Status](https://status.claude.com/) in the status bar.

Data source: [Statuspage API v2](https://status.claude.com/api/v2/summary.json) (public, no auth).

## Status bar

- Green check — all systems operational
- Warning — degraded performance or partial outage
- Error — major outage
- Tooltip lists affected components and active incidents

Click the item to open the status page.

## Commands

- **Claude Status: Refresh** — fetch latest status now
- **Claude Status: Open status page**

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `claudeStatus.refreshIntervalMinutes` | 5 | Poll interval (1–120 min) |

## Development

```bash
npm install
npm run check      # compile + self-check
npm run install:cursor   # package and install in Cursor
```

Press F5 in VS Code/Cursor to launch Extension Development Host.
