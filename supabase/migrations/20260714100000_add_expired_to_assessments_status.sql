-- Migration: Allow assessments.status to be 'expired' so jobs can be manually expired from the admin jobs management view

ALTER TABLE public.assessments
DROP CONSTRAINT IF EXISTS assements_status_check;

ALTER TABLE public.assessments
DROP CONSTRAINT IF EXISTS assessments_status_check;

ALTER TABLE public.assessments
ADD CONSTRAINT assessments_status_check
CHECK (status IN (
    'draft',
    'submitted',
    'pending',
    'pending_quote',
    'quote_accepted',
    'scheduled',
    'completed',
    'assigned',
    'live',
    'expired'
));
