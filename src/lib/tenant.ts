// Multi-tenant domain detection utility
// Maps frontend domain to tenant identifier

const DOMAIN_TO_TENANT: Record<string, string> = {
  'theberman.eu': 'ireland',
  'www.theberman.eu': 'ireland',
  'certificadoenergético.eu': 'spain',
  'www.certificadoenergético.eu': 'spain',
  'localhost': 'ireland', // default for local dev
};

export function getTenantFromDomain(): string {
  // Clean up any stale override left in localStorage from older builds —
  // the override is now per-tab (sessionStorage) so it doesn't leak into Ireland URLs
  // when developers are testing Spain locally.
  if (typeof localStorage !== 'undefined' && localStorage.getItem('dev_tenant_override')) {
    localStorage.removeItem('dev_tenant_override');
  }

  // Allow query param override for local testing: ?tenant=spain
  const urlParams = new URLSearchParams(window.location.search);
  const paramTenant = urlParams.get('tenant');
  if (paramTenant) {
    sessionStorage.setItem('dev_tenant_override', paramTenant);
    return paramTenant;
  }
  // Persist override across client-side navigation within the same tab only
  const storedTenant = sessionStorage.getItem('dev_tenant_override');
  if (storedTenant) return storedTenant;

  const hostname = window.location.hostname;
  return DOMAIN_TO_TENANT[hostname] || 'ireland';
}

export function getTenantDisplayName(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'The Berman',
    'spain': 'Certificado Energético',
  };
  return map[tenant] || tenant;
}

export function getTenantCurrency(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'EUR',
    'spain': 'EUR',
  };
  return map[tenant] || 'EUR';
}

export function getTenantWebsiteUrl(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'https://theberman.eu',
    'spain': 'https://certificadoenergético.eu',
  };
  return map[tenant] || 'https://theberman.eu';
}

export function getTenantEmail(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'hello@theberman.eu',
    'spain': 'hola@certificadoenergético.eu',
  };
  return map[tenant] || 'hello@theberman.eu';
}

export function getTenantDomain(tenant: string): string {
  const map: Record<string, string> = {
    'ireland': 'theberman.eu',
    'spain': 'certificadoenergético.eu',
  };
  return map[tenant] || 'theberman.eu';
}
