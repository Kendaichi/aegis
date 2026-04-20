# Tauri icons

Tauri needs real icon files listed in `tauri.conf.json` (`bundle.icon`).

Generate them from any square PNG (≥1024×1024) with:

```bash
npx @tauri-apps/cli icon path/to/source.png
```

This populates:

- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)
