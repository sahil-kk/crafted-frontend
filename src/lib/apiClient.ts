const BASE_URL = import.meta.env.VITE_API_URL || "https://crafted-1.onrender.com/api";

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth-token");
};

export const setAuthToken = (token: string) => {
  localStorage.setItem("auth-token", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("auth-token");
};

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export const apiClient = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const { params, headers, ...customConfig } = options;

  const token = getAuthToken();
  const isFormData = customConfig.body instanceof FormData;
  
  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  let url = `${BASE_URL}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Backend server is waking up (cold start). Please try signing in again in a few seconds.");
    }
    throw err;
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { msg: response.statusText };
    }
    throw new Error(errorData.msg || errorData.message || "An error occurred");
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T;
  }

  return response.json();
};
