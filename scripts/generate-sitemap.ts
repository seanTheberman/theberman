import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOWNS_BY_COUNTY } from '../src/data/irishTowns';
import { TOWNS_BY_COUNTY_SPAIN } from '../src/data/spainTowns';
import { TOWNS_BY_COUNTY_ENGLAND } from '../src/data/englandTowns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SitemapUrl {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: number;
}

const generateSitemap = (domain: string, tenant: string): string => {
    const urls: SitemapUrl[] = [];
    const baseUrl = `https://${domain}`;
    
    // Get location data based on tenant
    const locationData = tenant === 'spain' ? TOWNS_BY_COUNTY_SPAIN : tenant === 'england' ? TOWNS_BY_COUNTY_ENGLAND : TOWNS_BY_COUNTY;
    
    // Static pages
    const staticPages = [
        { path: '', priority: 1.0, changefreq: 'daily' },
        { path: 'about', priority: 0.8, changefreq: 'monthly' },
        { path: 'services', priority: 0.8, changefreq: 'monthly' },
        { path: 'pricing', priority: 0.8, changefreq: 'monthly' },
        { path: 'contact-us', priority: 0.6, changefreq: 'monthly' },
        { path: 'catalogue', priority: 0.9, changefreq: 'daily' },
        { path: 'locations', priority: 0.7, changefreq: 'weekly' },
        { path: 'faq', priority: 0.7, changefreq: 'monthly' },
        { path: 'news', priority: 0.8, changefreq: 'daily' },
        { path: 'blog', priority: 0.8, changefreq: 'daily' },
    ];
    
    staticPages.forEach(page => {
        urls.push({
            loc: page.path ? `${baseUrl}/${page.path}` : baseUrl,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: page.changefreq,
            priority: page.priority,
        });
    });
    
    // County pages
    Object.keys(locationData).forEach(county => {
        const countySlug = county.replace(/\s+/g, '-').toLowerCase();
        urls.push({
            loc: `${baseUrl}/${countySlug}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.6,
        });
        
        // Town pages
        locationData[county].forEach(town => {
            const townSlug = town.replace(/\s+/g, '-').toLowerCase();
            urls.push({
                loc: `${baseUrl}/${countySlug}/${townSlug}`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: 0.4,
            });
        });
    });
    
    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return xml;
};

// Generate sitemaps for all domains and write to public/
const domains = [
    { domain: 'theberman.eu', tenant: 'ireland' },
    { domain: 'certificadoenergético.eu', tenant: 'spain' },
    { domain: 'epccert.com', tenant: 'england' },
];

domains.forEach(({ domain, tenant }) => {
    const sitemap = generateSitemap(domain, tenant);
    console.log(`\n=== Sitemap for ${domain} (${tenant}) ===`);
    console.log(`Total URLs: ${(sitemap.match(/<url>/g) || []).length}`);

    const publicDir = path.join(__dirname, '..', 'public');
    const filename = domain.replace(/[^a-z0-9]/gi, '-');
    const outPath = path.join(publicDir, `sitemap-${filename}.xml`);
    fs.writeFileSync(outPath, sitemap);
    console.log(`Saved to: ${outPath}`);
});

// Also update the main sitemap.xml for the default (Irish) domain
const irishSitemap = generateSitemap('theberman.eu', 'ireland');
fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), irishSitemap);
console.log('\nUpdated public/sitemap.xml (Ireland default)');

export { generateSitemap };
