const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  const response = await fetch(url, config);

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
