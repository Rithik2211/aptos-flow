-- Add output column to workflow_runs table
ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS output JSONB;
