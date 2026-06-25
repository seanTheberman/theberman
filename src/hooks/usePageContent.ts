import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getTenantFromDomain } from '../lib/tenant';
import { getDefaultsForTenant, CMS_PAGES } from '../lib/cmsDefaults';

interface PageContentMap {
    [section: string]: Record<string, any>;
}

/**
 * Hook to load CMS content for a page, merged over defaults.
 * Returns section data keyed by section ID.
 * Values from the DB override defaults, so the frontend always has content.
 */
function getDefaultContentForPage(page: string, tenant: string): PageContentMap {
    const map: PageContentMap = {};
    const pageDef = CMS_PAGES.find(p => p.id === page);
    if (pageDef) {
        for (const section of pageDef.sections) {
            map[section.id] = getDefaultsForTenant(page, section.id, tenant);
        }
    }
    return map;
}

export function usePageContent(page: string): { content: PageContentMap; loading: boolean } {
    const tenant = getTenantFromDomain();
    const [content, setContent] = useState<PageContentMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchContent = async () => {
            try {
                const { data } = await supabase
                    .from('page_content')
                    .select('section, content')
                    .eq('page', page)
                    .eq('tenant', tenant)
                    .eq('is_active', true);

                if (!cancelled) {
                    const map = getDefaultContentForPage(page, tenant);

                    // Merge DB content over defaults (DB wins)
                    if (data) {
                        for (const row of data) {
                            map[row.section] = { ...(map[row.section] || {}), ...row.content };
                        }
                    }

                    setContent(map);
                }
            } catch (err) {
                console.error('Failed to load page content:', err);
                if (!cancelled) {
                    setContent(getDefaultContentForPage(page, tenant));
                }
            }
            if (!cancelled) setLoading(false);
        };

        fetchContent();
        return () => { cancelled = true; };
    }, [page, tenant]);

    return { content, loading };
}

/**
 * Helper to get a value from CMS content with a fallback.
 */
export function cmsValue(content: PageContentMap, section: string, key: string, fallback: string = ''): string {
    return content[section]?.[key] ?? fallback;
}
