import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  getDashboardData,
  type BedroomDistribution,
  type DashboardData,
  type PropertiesByCity,
} from "../api/dashboard";

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
    padding: "14px 30px 28px",
  },

  headerInner: {
    maxWidth: "1180px",
    margin: "0 auto",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    lineHeight: "1.1",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },

  main: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "34px 30px 46px",
  },

  error: {
    marginBottom: "24px",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "14px 16px",
  },

  message: {
    color: "#64748b",
    fontSize: "15px",
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "26px",
    marginBottom: "38px",
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "26px",
  },

  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "26px",
    minHeight: "110px",
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
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

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "26px",
    marginBottom: "26px",
  },

  chartCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "26px",
    minHeight: "360px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
  },

  panelSubtitle: {
    marginTop: "8px",
    marginBottom: "28px",
    color: "#73778a",
    fontSize: "15px",
  },

  barChart: {
    display: "flex",
    alignItems: "end",
    gap: "18px",
    height: "260px",
    paddingTop: "20px",
    paddingLeft: "10px",
    borderLeft: "1px solid #d1d5db",
    borderBottom: "1px solid #d1d5db",
  },

  pieWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "34px",
    minHeight: "260px",
    flexWrap: "wrap",
  },

  pieChart: {
    width: "185px",
    height: "185px",
    borderRadius: "50%",
    border: "1px solid #e5e7eb",
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

  insightCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "26px",
  },

  insightRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "18px",
  },

  insightIcon: {
    color: "#16a34a",
    fontSize: "18px",
    lineHeight: "1.2",
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
    <div style={styles.statCard}>
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

  const visibleData = data.slice(0, 5);
  const maxCount = Math.max(...visibleData.map((item) => item.propertyCount), 1);

  return (
    <div style={styles.barChart}>
      {visibleData.map((item) => {
        const heightPercent = Math.max((item.propertyCount / maxCount) * 100, 6);

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
                width: "78%",
                height: `${heightPercent}%`,
                backgroundColor: "#3b82f6",
              }}
            />

            <span
              style={{
                fontSize: "12px",
                color: "#737373",
                textAlign: "center",
                minHeight: "34px",
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

function BedroomDistributionChart({ data }: { data: BedroomDistribution[] }) {
  if (data.length === 0) {
    return <p style={styles.message}>No bedroom distribution data available.</p>;
  }

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
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
          ...styles.pieChart,
          background: pieBackground,
        }}
      />

      <div style={styles.legend}>
        {data.map((item, index) => {
          const percent = total === 0 ? 0 : Math.round((item.count / total) * 100);

          return (
            <div key={item.label} style={styles.legendRow}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "999px",
                  display: "inline-block",
                  backgroundColor: colors[index % colors.length],
                }}
              />

              <span>
                {item.label} {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardData();

        if (!ignore) {
          setDashboardData(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard.");
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

          <h1 style={styles.title}>Analytics Dashboard</h1>
        </div>
      </header>

      <main style={styles.main}>
        {error ? <p style={styles.error}>{error}</p> : null}

        <section style={styles.statGrid}>
          <StatCard
            title="Total Registered Properties"
            value={loading ? "—" : formatNumber(stats?.totalRegisteredProperties)}
            change="From public.properties"
            icon="▦"
          />

          <StatCard
            title="Cities Represented"
            value={loading ? "—" : formatNumber(stats?.totalCities)}
            change="Grouped by city"
            icon="⌂"
          />

          <StatCard
            title="Average Beds"
            value={loading ? "—" : formatNumber(stats?.averageBeds)}
            change="Average from beds column"
            icon="BR"
          />

          <StatCard
            title="Average Sqft"
            value={loading ? "—" : formatNumber(stats?.averageSqft)}
            change="Average from sqft column"
            icon="□"
          />
        </section>

        <section style={styles.chartGrid}>
          <div style={styles.chartCard}>
            <h2 style={styles.panelTitle}>Properties by City</h2>
            <p style={styles.panelSubtitle}>
              Count of registered properties grouped by city
            </p>

            <PropertiesByCityChart data={dashboardData?.propertiesByCity ?? []} />
          </div>

          <div style={styles.chartCard}>
            <h2 style={styles.panelTitle}>
              Unit Distribution by Bedroom Count
            </h2>
            <p style={styles.panelSubtitle}>
              Breakdown of registered properties by size
            </p>

            <BedroomDistributionChart
              data={dashboardData?.bedroomDistribution ?? []}
            />
          </div>
        </section>

        <section style={styles.insightCard}>
          <h2 style={styles.panelTitle}>Key Insights</h2>
          <p style={styles.panelSubtitle}>
            Data-driven observations from the property registry
          </p>

          {(dashboardData?.insights ?? []).map((insight) => (
            <div key={insight.title} style={styles.insightRow}>
              <span style={styles.insightIcon}>↗</span>

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