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

export async function getDashboardData(): Promise<DashboardData> {
  const response = await apiFetch("/api/dashboard");

  if (response.status === 401) {
    throw new Error("You must be logged in to view the dashboard.");
  }

  if (response.status === 403) {
    throw new Error("You do not have permission to view this dashboard.");
  }

  if (!response.ok) {
    let message = "Failed to load dashboard data.";

    try {
      const body = await response.json();

      if (body?.error) {
        message = body.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}