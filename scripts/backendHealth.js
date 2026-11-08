async function checkBackend() {
  const port = process.env.PORT || '5000';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    return {
      reachable: true,
      healthy: response.ok && body?.success === true && body?.data?.database === 'connected',
      port,
    };
  } catch {
    return { reachable: false, healthy: false, port };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { checkBackend };
