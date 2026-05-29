import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

type DashboardStats = {
  totalRegisteredProperties: number;
  totalCities: number;
  averageBeds: number;
  averageBaths: number;
  averageSqft: number;
};

type PropertiesByCity = {
  city: string;
  propertyCount: number;
};

type BedroomDistribution = {
  label: string;
  count: number;
};

type DashboardInsight = {
  title: string;
  description: string;
  type: string;
};

type DashboardData = {
  stats: DashboardStats;
  propertiesByCity: PropertiesByCity[];
  bedroomDistribution: BedroomDistribution[];
  insights: DashboardInsight[];
};

type ApiErrorBody = {
  error?: string;
  message?: string;
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  header: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "24px 28px 32px",
  },

  headerInner: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
  },

  backLink: {
    display: "inline-block",
    color: "#2563eb",
    textDecoration: "none",
    fontSize: "14px",
    marginBottom: "12px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    lineHeight: "1.15",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "16px",
  },

  badge: {
    marginTop: "44px",
    borderRadius: "10px",
    padding: "12px 14px",
    backgroundColor: "#f1f5f9",
    color: "#111827",
    fontSize: "14px",
  },

  main: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "34px 28px",
  },

  message: {
    marginBottom: "18px",
    color: "#64748b",
  },

  error: {
    marginBottom: "18px",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "12px 14px",
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "26px",
    marginBottom: "34px",
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "26px",
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },

  statTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 500,
  },

  statIcon: {
    color: "#64748b",
    fontSize: "18px",
  },

  statValue: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },

  statChange: {
    marginTop: "6px",
    marginBottom: 0,
    color: "#16a34a",
    fontSize: "13px",
  },

  tabs: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#e9ebf0",
    borderRadius: "999px",
    padding: "4px",
    marginBottom: "34px",
  },

  tabActive: {
    border: "none",
    backgroundColor: "#ffffff",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "14px",
    color: "#111827",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.12)",
  },

  tab: {
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "14px",
    color: "#111827",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "26px",
    marginBottom: "26px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
  },

  panelSubtitle: {
    marginTop: "8px",
    marginBottom: "22px",
    color: "#73778a",
    fontSize: "15px",
  },

  barChart: {
    display: "flex",
    alignItems: "end",
    gap: "18px",
    height: "260px",
    paddingTop: "20px",
  },

  pieWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "32px",
    minHeight: "260px",
    flexWrap: "wrap",
  },

  legend: {
    minWidth: "150px",
  },

  legendRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    fontSize: "14px",
    color: "#334155",
  },

  insightRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "16px",
  },

  insightTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
  },

  insightText: {
    marginTop: "4px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "14px",
  },
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

async function loadDashboardData(): Promise<DashboardData> {
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

function formatNumber(value: number | undefined) {
  return value === undefined ? "—" : value.toLocaleString();
}

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
};

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.statTop}>
        <p style={styles.statTitle}>{title}</p>
        <span style={styles.statIcon}>{icon}</span>
      </div>

      <p style={styles.statValue}>{value}</p>
      <p style={styles.statChange}>{change}</p>
    </div>
  );
}

function PropertiesByCityChart({ data }: { data: PropertiesByCity[] }) {
  if (data.length === 0) {
    return <p style={styles.message}>No property data available yet.</p>;
  }

  const visibleData = data.slice(0, 8);
  const maxCount = Math.max(
    ...visibleData.map((item) => item.propertyCount),
    1
  );

  return (
    <div style={styles.barChart}>
      {visibleData.map((item) => {
        const heightPercent = Math.max(
          (item.propertyCount / maxCount) * 100,
          4
        );

        return (
          <div
            key={item.city}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "end",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              {item.propertyCount.toLocaleString()}
            </span>

            <div
              style={{
                width: "100%",
                maxWidth: "72px",
                height: `${heightPercent}%`,
                backgroundColor: "#3b82f6",
                borderRadius: "8px 8px 0 0",
              }}
            />

            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
                textAlign: "center",
                minHeight: "32px",
              }}
            >
              {item.city}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BedroomDistributionChart({
  data,
}: {
  data: BedroomDistribution[];
}) {
  if (data.length === 0) {
    return <p style={styles.message}>No bedroom distribution data available.</p>;
  }

  const colors = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const total = data.reduce((sum, item) => sum + item.count, 0);

  let start = 0;

  const gradientParts = data.map((item, index) => {
    const degrees = total === 0 ? 0 : (item.count / total) * 360;
    const end = start + degrees;
    const color = colors[index % colors.length];
    const part = `${color} ${start}deg ${end}deg`;

    start = end;

    return part;
  });

  const pieBackground =
    total === 0 ? "#e5e7eb" : `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div style={styles.pieWrapper}>
      <div
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: pieBackground,
          border: "1px solid #e5e7eb",
        }}
      />

      <div style={styles.legend}>
        {data.map((item, index) => {
          const percent =
            total === 0 ? 0 : Math.round((item.count / total) * 100);

          return (
            <div key={item.label} style={styles.legendRow}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  display: "inline-block",
                  backgroundColor: colors[index % colors.length],
                }}
              />

              <span>
                {item.label}: {item.count.toLocaleString()} ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        setLoading(true);
        setError("");

        const data = await loadDashboardData();

        if (!ignore) {
          setDashboardData(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = dashboardData?.stats;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <Link to="/" style={styles.backLink}>
              ← Back to Home
            </Link>

            <h1 style={styles.title}>Policy Maker Analytics Dashboard</h1>
            <p style={styles.subtitle}>
              Property registry insights from the Supabase public.properties
              table
            </p>
          </div>

          <div style={styles.badge}>Protected dashboard</div>
        </div>
      </header>

      <main style={styles.main}>
        {loading ? (
          <p style={styles.message}>Loading dashboard data...</p>
        ) : null}

        {error ? <p style={styles.error}>{error}</p> : null}

        <section style={styles.statGrid}>
          <StatCard
            title="Total Registered Properties"
            value={formatNumber(stats?.totalRegisteredProperties)}
            change={loading ? "Loading..." : "From public.properties"}
            icon="▦"
          />

          <StatCard
            title="Cities Represented"
            value={formatNumber(stats?.totalCities)}
            change={loading ? "Loading..." : "Grouped by city"}
            icon="⌂"
          />

          <StatCard
            title="Average Beds"
            value={formatNumber(stats?.averageBeds)}
            change={loading ? "Loading..." : "Average from beds column"}
            icon="BR"
          />

          <StatCard
            title="Average Sqft"
            value={formatNumber(stats?.averageSqft)}
            change={loading ? "Loading..." : "Average from sqft column"}
            icon="□"
          />
        </section>

        <div style={styles.tabs}>
          <button type="button" style={styles.tabActive}>
            Overview
          </button>
          <button type="button" style={styles.tab}>
            Geographic Data
          </button>
          <button type="button" style={styles.tab}>
            Property Mix
          </button>
        </div>

        <section style={styles.chartGrid}>
          <div style={styles.card}>
            <h2 style={styles.panelTitle}>Properties by City</h2>
            <p style={styles.panelSubtitle}>
              Count of registered properties grouped by the city column
            </p>

            <PropertiesByCityChart
              data={dashboardData?.propertiesByCity ?? []}
            />
          </div>

          <div style={styles.card}>
            <h2 style={styles.panelTitle}>Properties by Bedroom Count</h2>
            <p style={styles.panelSubtitle}>
              Breakdown of registered properties using the beds column
            </p>

            <BedroomDistributionChart
              data={dashboardData?.bedroomDistribution ?? []}
            />
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.panelTitle}>Key Insights</h2>
          <p style={styles.panelSubtitle}>
            Data-driven observations from the property registry
          </p>

          {(dashboardData?.insights ?? []).map((insight) => (
            <div key={insight.title} style={styles.insightRow}>
              <span style={{ color: "#2563eb" }}>●</span>

              <div>
                <p style={styles.insightTitle}>{insight.title}</p>
                <p style={styles.insightText}>{insight.description}</p>
              </div>
            </div>
          ))}

          {!loading && !error && dashboardData?.insights.length === 0 ? (
            <p style={styles.message}>No insights available yet.</p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;