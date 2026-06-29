# Product demo — guided tour of the live cockpit

A ~45s screen-tour of the **actual** MPI Cost Cockpit UI: cross-asset benchmark →
ambition dial → cost-out bridge → AI Copilot, driven by a scripted cursor with
caption callouts (no slides — the real app, recorded in one continuous view).

## Outputs (`demo-videos/`)
| File | Spec |
|---|---|
| `zbb-cockpit-tour-1080.mp4` | 45s · 1920×1080 · H.264 |
| `zbb-cockpit-tour-4k.mp4` | 45s · 3840×2160 · H.264 |
| `zbb-cockpit-tour-30s-social.mp4` | 30s highlight cut |

## Regenerate
```bash
# 1. Build the app WITHOUT Supabase env so it loads the bundled JSON locally
mv .env.production .env.production.bak && npm run build && mv .env.production.bak .env.production

# 2. Render tooling (dev-only; not shipped with the app)
npm i -D playwright-core @ffmpeg-installer/ffmpeg

# 3. Serve the built app + a stubbed streaming /api/copilot, then record
node demo/tooling/serve.cjs &          # http://localhost:5050
node demo/tooling/record-tour.cjs      # writes a .webm to a temp dir

# 4. Transcode the webm to mp4 with the ffmpeg from @ffmpeg-installer/ffmpeg
#    (see record-tour.cjs output for the webm path)

npm uninstall playwright-core @ffmpeg-installer/ffmpeg   # keep app deps clean
```

`record-tour.cjs` injects a fake cursor + caption overlay and drives the real
controls (capture slider, entity drill, tab switches, Copilot suggestion). The
Copilot answer is streamed by the local stub in `serve.cjs`; in production the
same UI streams from the `/api/copilot` Claude function.
