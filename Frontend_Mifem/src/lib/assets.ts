const base = import.meta.env.BASE_URL || '/';

function asset(path: string): string {
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${path.replace(/^\//, '')}`;
}

/**
 * Brand assets live in `public/` so they are copied verbatim by Vite on every
 * build. Unlike the runtime uploads folder, these never depend on a custom
 * build hook or a backend being online, so they render on any deployment.
 */
export const ADVENTIST_LOGO = asset('upload/adventist-logo.png');
export const MIFEM_LOGO = asset('upload/MIFEM_logo.png');
export const MIFEM_FAVICON = asset('upload/mifem.png');
