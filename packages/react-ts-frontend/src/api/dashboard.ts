import { apiFetch } from "../lib/api";

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

export async function getDashboardData(): Promise<DashboardData> {
  const response = await apiFetch("/api/dashboard", {
    method: "GET",
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