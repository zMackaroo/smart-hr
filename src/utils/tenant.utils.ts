import {
  DEV_TENANT_QUERY_PARAM,
  PLATFORM_HOSTS,
  TENANT_DOMAIN_SUFFIX,
} from '../config/tenant.config'

export function isPlatformHostname(hostname: string): boolean {
  return (PLATFORM_HOSTS as readonly string[]).includes(hostname)
}

/** Parse tenant slug from hostname (not query param). */
export function parseSubdomainFromHostname(hostname: string): string | null {
  if (isPlatformHostname(hostname)) return null

  if (hostname.endsWith('.localhost')) {
    const slug = hostname.replace(/\.localhost$/, '')
    return slug && !isPlatformHostname(slug) ? slug : null
  }

  const suffix = `.${TENANT_DOMAIN_SUFFIX}`
  if (hostname.endsWith(suffix)) {
    const slug = hostname.slice(0, -suffix.length)
    if (!slug || slug.includes('.') || slug === 'app' || slug === 'www') return null
    return slug
  }

  return null
}

export function getDevTenantSlugFromSearch(search: string): string | null {
  const params = new URLSearchParams(search)
  const tenant = params.get(DEV_TENANT_QUERY_PARAM)?.trim().toLowerCase()
  return tenant || null
}

/** Resolve slug from hostname + optional dev query override on localhost. */
export function resolveTenantSlug(hostname: string, search: string): string | null {
  const fromHost = parseSubdomainFromHostname(hostname)
  if (fromHost) return fromHost

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return getDevTenantSlugFromSearch(search)
  }

  return null
}

export function buildTenantLoginUrl(slug: string): string {
  const { protocol, port } = window.location
  const portSuffix = port ? `:${port}` : ''

  if (import.meta.env.DEV) {
    return `${protocol}//${window.location.hostname}${portSuffix}/login?${DEV_TENANT_QUERY_PARAM}=${encodeURIComponent(slug)}`
  }

  return `${protocol}//${slug}.${TENANT_DOMAIN_SUFFIX}/login`
}

export function buildTenantWorkspaceUrl(slug: string): string {
  const { protocol, port } = window.location
  const portSuffix = port ? `:${port}` : ''

  if (import.meta.env.DEV) {
    return `${protocol}//${window.location.hostname}${portSuffix}?${DEV_TENANT_QUERY_PARAM}=${encodeURIComponent(slug)}`
  }

  return `${protocol}//${slug}.${TENANT_DOMAIN_SUFFIX}`
}

export function getPlatformUrl(path = '/'): string {
  const { protocol, port } = window.location
  const portSuffix = port ? `:${port}` : ''
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (import.meta.env.DEV) {
    return `${protocol}//localhost${portSuffix}${normalizedPath}`
  }

  return `${protocol}//app.${TENANT_DOMAIN_SUFFIX}${normalizedPath}`
}

export function getPlatformRegisterUrl(): string {
  return getPlatformUrl('/register')
}
