export type DashboardStats = {
  totalRegisteredProperties: number;
  totalCities: number;
  averageBeds: number;
  averageBaths: number;
  averageSqft: number;
};

export type PropertiesByCity = {
  city: string;
  propertyCount: number;
};

export type BedroomDistribution = {
  label: string;
  count: number;
};

export type DashboardInsight = {
  title: string;
  description: string;
  type: string;
};

export type DashboardData = {
  stats: DashboardStats;
  propertiesByCity: PropertiesByCity[];
  bedroomDistribution: BedroomDistribution[];
  insights: DashboardInsight[];
};

type ApiErrorBody = {
  error?: string;
  message?: string;
};

async function readErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
}

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [rawKey, ...rawValueParts] = cookie.trim().split("=");

    if (rawKey === name) {
      return decodeURIComponent(rawValueParts.join("="));
    }
  }

  return null;
}

function getAuthToken(): string | null {
  return (
    getCookie("access_token") ||
    getCookie("accessToken") ||
    getCookie("supabase_access_token") ||
    getCookie("jwt") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("supabase_access_token") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("supabase_access_token") ||
    sessionStorage.getItem("jwt")
  );
}

export async function getDashboardData(): Promise<DashboardData> {
  const token = getAuthToken();

  console.log("dashboard token exists?", Boolean(token));

  const response = await fetch("/api/dashboard", {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    throw new Error(
      await readErrorMessage(
        response,
        "You must be logged in to view the dashboard."
      )
    );
  }

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage(
        response,
        "You do not have permission to view this dashboard."
      )
    );
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load dashboard data.")
    );
  }

  return (await response.json()) as DashboardData;
}