import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    noindex?: boolean;
}

const SITE_NAME = 'The Berman';
const DEFAULT_OG_IMAGE = 'https://theberman.eu/logo.png';
const BASE_URL = 'https://theberman.eu';

const SEOHead = ({
    title,
    description,
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    jsonLd,
    noindex = false,
}: SEOHeadProps) => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

    return (
        <Helmet>
            {/* Google Tag Manager */}
            <script>{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-57CD932S');`}</script>
            {/* End Google Tag Manager */}

            {/* Google Analytics */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-BLJ6KWN29Y"></script>
            <script>{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-BLJ6KWN29Y');`}</script>
            {/* End Google Analytics */}

            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={SITE_NAME} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta property="og:image" content={ogImage} />
            <meta property="og:locale" content="en_IE" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEOHead;
