import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PageContentMap {
    [section: string]: Record<string, any>;
}

export function usePageContent(page: string): { content: PageContentMap; loading: boolean } {
    const [content, setContent] = useState<PageContentMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetch = async () => {
            const { data } = await supabase
                .from('page_content')
                .select('section, content')
                .eq('page', page)
                .eq('is_active', true);

            if (!cancelled && data) {
                const map: PageContentMap = {};
                for (const row of data) {
                    map[row.section] = row.content;
                }
                setContent(map);
            }
            if (!cancelled) setLoading(false);
        };

        fetch();
        return () => { cancelled = true; };
    }, [page]);

    return { content, loading };
}
