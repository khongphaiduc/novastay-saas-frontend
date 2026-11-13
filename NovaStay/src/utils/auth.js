const API_URL = import.meta.env?.VITE_API_URL || '';

let refreshPromise = null;
let refreshRetryAt = 0;
let limitedRefreshToken = null;

function rateLimitError(seconds) {
  const error = new Error(`Bạn thao tác quá nhanh. Vui lòng thử lại sau ${seconds} giây.`);
  error.status = 429;
  error.retryAfterSeconds = seconds;
  return error;
}

/** Share one refresh operation; a temporary limit/network error must not sign the user out. */
export async function refreshToken() {
  if (refreshPromise) return refreshPromise;
  const accountStr = localStorage.getItem('ns_account');
  if (!accountStr) throw new Error('No account info found in localStorage');
  const account = JSON.parse(accountStr);
  const refreshTokenVal = account.refreshToken;
  if (!refreshTokenVal) throw new Error('No refresh token found in localStorage');
  if (limitedRefreshToken === refreshTokenVal && refreshRetryAt > Date.now()) {
    throw rateLimitError(Math.max(1, Math.ceil((refreshRetryAt - Date.now()) / 1000)));
  }

  refreshPromise = (async () => {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ RefreshToken: refreshTokenVal }),
    });
    // Ignore stale responses after the user signs out or switches accounts.
    if (localStorage.getItem('ns_account') !== accountStr) {
      throw new Error('Session changed during token refresh');
    }
    if (res.status === 429) {
      const seconds = Math.max(1, Number(res.headers.get('Retry-After')) || 60);
      limitedRefreshToken = refreshTokenVal;
      refreshRetryAt = Date.now() + seconds * 1000;
      throw rateLimitError(seconds);
    }
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('ns_account');
        localStorage.removeItem('ns_dashboard');
      }
      throw new Error(`Token refresh API returned status ${res.status}`);
    }
    const data = await res.json();
    if (localStorage.getItem('ns_account') !== accountStr) {
      throw new Error('Session changed during token refresh');
    }
    localStorage.setItem('ns_account', JSON.stringify({
      ...account,
      accessToken: data.accessToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      ...(data.refreshToken && { refreshToken: data.refreshToken }),
      ...(data.refreshTokenExpiresAt && { refreshTokenExpiresAt: data.refreshTokenExpiresAt }),
    }));
    refreshRetryAt = 0;
    limitedRefreshToken = null;
    return data.accessToken;
  })();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Checks if the stored access token is expired or close to expiration (within 30 seconds).
 */
export function isTokenExpired() {
  const accountStr = localStorage.getItem('ns_account');
  if (!accountStr) return true;

  try {
    const account = JSON.parse(accountStr);
    if (!account.accessToken || !account.accessTokenExpiresAt) return true;

    const expiresAt = new Date(account.accessTokenExpiresAt).getTime();
    // Return true if expired or will expire in less than 30 seconds
    return expiresAt - Date.now() < 30000;
  } catch {
    return true;
  }
}

/**
 * Hooks into window.fetch to automatically refresh expired/expiring tokens.
 */
export function setupFetchInterceptor() {
  const originalFetch = window.fetch;
  window.fetch = async function (resource, options = {}) {
    const urlString = typeof resource === 'string' ? resource : resource.url;

    // Avoid intercepting the refresh token request itself to prevent infinite loop
    if (urlString.includes('/api/auth/refresh')) {
      return originalFetch.apply(this, arguments);
    }

    // Only intercept if we have a session and the request is to our backend API
    const accountStr = localStorage.getItem('ns_account');
    const isApiCall = (API_URL && urlString.startsWith(API_URL)) || urlString.startsWith('/api/') || urlString.includes('/api/');

    if (accountStr && isApiCall) {
      try {
        const account = JSON.parse(accountStr);
        if (account.refreshToken && isTokenExpired()) {
          try {
            const newAccessToken = await refreshToken();
            
            // Update the authorization header inside options
            if (options.headers) {
              if (options.headers instanceof Headers) {
                options.headers.set('Authorization', `Bearer ${newAccessToken}`);
              } else if (Array.isArray(options.headers)) {
                const authIdx = options.headers.findIndex(([k]) => k.toLowerCase() === 'authorization');
                if (authIdx !== -1) {
                  options.headers[authIdx][1] = `Bearer ${newAccessToken}`;
                } else {
                  options.headers.push(['Authorization', `Bearer ${newAccessToken}`]);
                }
              } else {
                options.headers['Authorization'] = `Bearer ${newAccessToken}`;
              }
            }
          } catch (err) {
            if (err.status === 429) {
              return new Response(JSON.stringify({ code: 'RATE_LIMIT_EXCEEDED', message: err.message,
                retryAfterSeconds: err.retryAfterSeconds }), {
                status: 429,
                headers: { 'Content-Type': 'application/json', 'Retry-After': String(err.retryAfterSeconds) },
              });
            }
            console.error('Failed to auto refresh token on fetch:', err);
          }
        }
      } catch (e) {
        console.error('Error parsing ns_account during fetch interception:', e);
      }
    }

    return originalFetch.apply(this, arguments);
  };
}
