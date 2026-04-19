"""
One-shot: copy lat/lng from videos into reports where report lat/lng are NULL.

Run from apps/api with PYTHONPATH including the project root, e.g.:

    cd apps/api
    python -m app.scripts.backfill_report_locations
"""

from __future__ import annotations

from app.db import get_supabase


def main() -> None:
    sb = get_supabase()
    reports_res = sb.table("reports").select("report_id, video_id, lat, lng").execute()
    all_rows = reports_res.data or []
    rows = [r for r in all_rows if r.get("lat") is None or r.get("lng") is None]

    scanned = len(rows)
    updated = 0
    skipped_no_video_coords = 0

    for row in rows:
        vid = row.get("video_id")
        if not vid:
            skipped_no_video_coords += 1
            continue

        vr = (
            sb.table("videos")
            .select("lat, lng")
            .eq("video_id", vid)
            .maybe_single()
            .execute()
        )
        if not vr.data:
            skipped_no_video_coords += 1
            continue

        lat, lng = vr.data.get("lat"), vr.data.get("lng")
        if lat is None or lng is None:
            skipped_no_video_coords += 1
            continue

        sb.table("reports").update({"lat": lat, "lng": lng}).eq("report_id", row["report_id"]).execute()
        updated += 1

    print(
        f"backfill_report_locations: scanned={scanned} updated={updated} "
        f"skipped_no_video_coords={skipped_no_video_coords}"
    )


if __name__ == "__main__":
    main()
