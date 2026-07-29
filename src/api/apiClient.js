import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// JWT_TTL is intentionally short (60min - see AuthController::refresh) so a
// leaked token doesn't stay usable for long. Without this, that same
// shortness meant anyone mid-shift got silently logged out - every request
// failing with no obvious cause until they happened to refresh the page.
// On a 401, try to refresh the token once and replay the original request;
// only fall back to a real login redirect if the refresh itself fails
// (refresh_ttl - 14 days - actually elapsed, or there was never a token).
let refreshPromise = null;

function clearSessionAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (
      response?.status !== 401 ||
      !config ||
      config._retried ||
      config.url?.includes("/login") ||
      config.url?.includes("/refresh")
    ) {
      return Promise.reject(error);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return Promise.reject(error);
    }

    config._retried = true;

    try {
      // Concurrent requests that all 401 around the same moment share one
      // in-flight refresh instead of each hammering the endpoint.
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${apiClient.defaults.baseURL}/refresh`, null, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const { data } = await refreshPromise;
      localStorage.setItem("token", data.token);
      config.headers.Authorization = `Bearer ${data.token}`;
      return apiClient(config);
    } catch (refreshError) {
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
