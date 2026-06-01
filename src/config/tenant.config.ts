/** Base domain for tenant subdomains — e.g. `igo.smarthr.net` */
export const TENANT_DOMAIN_SUFFIX =
  import.meta.env.VITE_TENANT_DOMAIN_SUFFIX ?? 'localhost'

/** Hostnames that resolve to platform mode (no tenant from hostname). */
export const PLATFORM_HOSTS = [
  'localhost',
  '127.0.0.1',
  'app.localhost',
  `app.${TENANT_DOMAIN_SUFFIX}`,
] as const

/** Dev-only query param: `?tenant=acme` on localhost */
export const DEV_TENANT_QUERY_PARAM = 'tenant'

export const RESERVED_SLUGS = [
  'www',
  'app',
  'api',
  'admin',
  'login',
  'register',
  'static',
  'cdn',
  'mail',
  'support',
  'help',
  'docs',
  'status',
  'billing',
] as const

export type ReservedSlug = (typeof RESERVED_SLUGS)[number]

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug.toLowerCase())
}
