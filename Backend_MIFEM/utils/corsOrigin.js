const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

const isAllowedOrigin = (origin, allowedOrigins, isDevelopment) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalizedOrigin)) return true;

  return (
    isDevelopment &&
    /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(normalizedOrigin)
  );
};

module.exports = { isAllowedOrigin, normalizeOrigin };
