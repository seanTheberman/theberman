// Shared tenant → language helpers for edge function email templates
export type Lang = 'en' | 'es' | 'pt' | 'fr';

export function getLang(tenant: string): Lang {
    if (tenant === 'spain') return 'es';
    if (tenant === 'portugal') return 'pt';
    if (tenant === 'france') return 'fr';
    return 'en';
}

export function pick<T>(lang: string, opts: { en: T; es?: T; pt?: T; fr?: T }): T {
    return (opts as Record<string, T>)[lang] ?? opts.en;
}
