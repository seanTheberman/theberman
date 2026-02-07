-- 1. Enable extensions (run these first)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- 2. Schedule the job reminder cron
-- IMPORTANT: Replace 'SUPABASE_SERVICE_ROLE_KEY' with your actual service role key
-- This runs every day at 9:00 AM UTC

SELECT cron.schedule(
    'send-daily-job-reminder',
    '0 9 * * *',
    $job_reminder$
    SELECT
      net.http_post(
        url:='https://hsxqcbcgpruldodaxmdg.supabase.co/functions/v1/send-job-reminder-cron',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer SUPABASE_SERVICE_ROLE_KEY"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $job_reminder$
);

-- Note: In the query above, ensure you replace SUPABASE_SERVICE_ROLE_KEY 
-- with your actual token from Settings -> API -> service_role key.
