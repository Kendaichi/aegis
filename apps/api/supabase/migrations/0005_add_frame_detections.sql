-- Add per-frame localized detections (bounding boxes) for AI object-style overlays.

alter table frame_analyses
  add column if not exists detections jsonb not null default '[]'::jsonb;

comment on column frame_analyses.detections is
  'JSON array of {label, severity, bbox: [x1,y1,x2,y2] normalized 0-1, confidence}';
