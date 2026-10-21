const API_URL = import.meta.env.VITE_API_URL || '';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Calls /api/auth/refresh with the stored RefreshToken to get a new accessToken.
 */
export async function refreshToken() {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(token);
      });
    });
  }

  const accountStr = localStorage.getItem('ns_account');
  if (!accountStr) {
    throw new Error('No account info found in localStorage');
  }

  const account = JSON.parse(accountStr);
  const refreshTokenVal = account.refreshToken;

  if (!refreshTokenVal) {
    throw new Error('No refresh token found in localStorage');
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        RefreshToken: refreshTokenVal,
      }),
    });

    if (!res.ok) {
      throw new Error(`Token refresh API returned status ${res.status}`);
    }

    const data = await res.json();
    const updatedAccount = {
      ...account,
      accessToken: data.accessToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      ...(data.refreshToken && { refreshToken: data.refreshToken }),
      ...(data.refreshTokenExpiresAt && { refreshTokenExpiresAt: data.refreshTokenExpiresAt }),
    };

    localStorage.setItem('ns_account', JSON.stringify(updatedAccount));
    isRefreshing = false;
    onRefreshed(data.accessToken);

    return data.accessToken;
  } catch (error) {
    isRefreshing = false;
    // Clear account if refresh fails to force relogin
    localStorage.removeItem('ns_account');
    localStorage.removeItem('ns_dashboard');
    refreshSubscribers = [];
    throw error;
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
  } catch (e) {
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
            console.log('Access token expired or expiring soon, initiating silent refresh...');
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
