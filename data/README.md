# WC26 archived results

Frozen copy of ESPN’s World Cup 2026 endpoints, captured so the site keeps
working if the live API disappears.

| File | Source |
|------|--------|
| `scoreboard.json` | ESPN site API scoreboard (`dates=20260611-20260719`) |
| `standings.json` | ESPN standings (`season=2026`) |
| `pens.json` | Shootout kicks from ESPN summary for pen matches |
| `meta.json` | Capture timestamp + counts |

The app tries the live ESPN URLs first, then falls back to these files.
See `meta.json` for when this snapshot was taken.
