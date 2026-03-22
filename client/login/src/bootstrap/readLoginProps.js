export function readLoginProps() {
  const el = document.getElementById('login-props');
  if (!el?.textContent?.trim()) {
    return { message: null, justRegistered: false };
  }
  try {
    const data = JSON.parse(el.textContent);
    return {
      message: typeof data.message === 'string' ? data.message : data.message ?? null,
      justRegistered: Boolean(data.justRegistered),
    };
  } catch {
    return { message: null, justRegistered: false };
  }
}
