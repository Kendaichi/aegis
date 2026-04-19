-- Ensure older databases have the localized detections column used by /analyze.
-- Safe to run even if 0005_add_frame_detections.sql was already applied.

alter table if exists frame_analyses
  add column if not exists detections jsonb not null default '[]'::jsonb;

comment on column frame_analyses.detections is
  'JSON array of {label, severity, bbox: [x1,y1,x2,y2] normalized 0-1, confidence}';
