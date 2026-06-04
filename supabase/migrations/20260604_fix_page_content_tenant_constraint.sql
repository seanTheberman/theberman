-- Fix page_content unique constraint to include tenant
-- The original constraint UNIQUE(page, section) prevented multiple tenants
-- from saving the same page+section combination.

-- Add tenant column if it doesn't already exist (e.g. from manual schema changes)
ALTER TABLE page_content
ADD COLUMN IF NOT EXISTS tenant TEXT;

-- Drop the old unique constraint that did not include tenant.
-- PostgreSQL auto-generated name is page_content_page_section_key.
ALTER TABLE page_content
DROP CONSTRAINT IF EXISTS page_content_page_section_key;

-- Add new unique constraint that includes tenant so each tenant can have
-- its own copy of the same page+section.
ALTER TABLE page_content
ADD CONSTRAINT page_content_page_section_tenant_key UNIQUE (page, section, tenant);
