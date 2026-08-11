-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a job to run every day at midnight (UTC)
-- Deletes rows from activity_log that are older than 30 days
SELECT cron.schedule(
  'delete-old-activity-logs', -- name of the cron job
  '0 0 * * *',                -- cron schedule (every day at midnight)
  $$
    DELETE FROM public.activity_log WHERE created_at < NOW() - INTERVAL '30 days';
  $$
);
