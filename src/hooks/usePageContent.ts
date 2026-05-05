import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getTenantFromDomain } from '../lib/tenant';
import { getDefaultsForTenant } from '../lib/cmsDefaults';

interface PageContentMap {
    [section: string]: Record<string, any>;
}

/**
 * Hook to load CMS content for a page, merged over defaults.
 * Returns section data keyed by section ID.
 * Values from the DB override defaults, so the frontend always has content.
 */
export function usePageContent(page: string): { content: PageContentMap; loading: boolean } {
    const [content, setContent] = useState<PageContentMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const tenant = getTenantFromDomain();

        const fetchContent = async () => {
            try {
                const { data } = await supabase
                    .from('page_content')
                    .select('section, content')
                    .eq('page', page)
                    .eq('tenant', tenant)
                    .eq('is_active', true);

                if (!cancelled) {
                    const map: PageContentMap = {};
                    if (data) {
                        for (const row of data) {
                            const defaults = getDefaultsForTenant(page, row.section, tenant);
                            map[row.section] = { ...defaults, ...row.content };
                        }
                    }
                    setContent(map);
                }
            } catch (err) {
                console.error('Failed to load page content:', err);
            }
            if (!cancelled) setLoading(false);
        };

        fetchContent();
        return () => { cancelled = true; };
    }, [page]);

    return { content, loading };
}

/**
 * Helper to get a value from CMS content with a fallback.
 */
export function cmsValue(content: PageContentMap, section: string, key: string, fallback: string = ''): string {
    return content[section]?.[key] ?? fallback;
}
