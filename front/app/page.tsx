"use client";

import { useMemo, useState } from "react";

type ChartPoint = {
  label: string;
  value: number;
};

type PatternInsight = {
  title: string;
  severity: "info" | "warning" | "critical";
  description: string;
};

type PredictionRow = {
  date: string;
  forecast: number;
  lower: number;
  upper: number;
};

const sampleMapping = {
  intent: "로딩시간 TOP N",
  parameters: {
    days: 7,
    topN: 10
  },
  sql: "SELECT page_name, avgMerge(avg_loading_tm) AS avg_loading FROM maxy_page_daily WHERE log_date >= today()-7 GROUP BY page_name ORDER BY avg_loading DESC LIMIT 10"
};

const sampleResult = {
  columns: ["page_name", "avg_loading"],
  rows: [
    ["/home", 1.42],
    ["/login", 1.38],
    ["/checkout", 1.31],
    ["/search", 1.18],
    ["/profile", 1.05]
  ]
};

const chartData: ChartPoint[] = [
  { label: "09/01", value: 1.12 },
  { label: "09/02", value: 1.28 },
  { label: "09/03", value: 1.41 },
  { label: "09/04", value: 1.32 },
  { label: "09/05", value: 1.55 },
  { label: "09/06", value: 1.47 },
  { label: "09/07", value: 1.62 }
];

const patternInsights: PatternInsight[] = [
  {
    title: "로딩 시간 급증",
    severity: "warning",
    description: "09/05~09/07 구간에서 평균 로딩 시간이 18% 상승했습니다."
  },
  {
    title: "에러율 급등",
    severity: "critical",
    description: "특정 페이지(/checkout)에서 오류율이 2.1배 증가했습니다."
  },
  {
    title: "안정 구간",
    severity: "info",
    description: "09/01~09/03 구간은 성능 지표가 안정적으로 유지되었습니다."
  }
];

const predictionRows: PredictionRow[] = [
  { date: "09/08", forecast: 1.58, lower: 1.42, upper: 1.74 },
  { date: "09/09", forecast: 1.61, lower: 1.45, upper: 1.78 },
  { date: "09/10", forecast: 1.63, lower: 1.46, upper: 1.81 },
  { date: "09/11", forecast: 1.66, lower: 1.48, upper: 1.85 }
];

const reportCards = [
  {
    title: "요약 리포트",
    body: "최근 7일 평균 로딩 시간은 1.39s이며, 최고치는 09/07에 기록되었습니다."
  },
  {
    title: "추천 액션",
    body: "09/05 이후 증가한 로딩 시간을 기준으로 /checkout 페이지 리소스를 점검하세요."
  },
  {
    title: "모니터링 포인트",
    body: "TTFB가 증가하는 경향이 있으므로 서버 응답 시간 분포를 추가로 확인하세요."
  }
];

const severityColors: Record<PatternInsight["severity"], string> = {
  info: "#2563eb",
  warning: "#d97706",
  critical: "#dc2626"
};

function SimpleLineChart({ data }: { data: ChartPoint[] }) {
  const { path, points } = useMemo(() => {
    if (data.length === 0) {
      return { path: "", points: [] as { x: number; y: number }[] };
    }

    const width = 520;
    const height = 160;
    const padding = 20;
    const values = data.map((item) => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const xStep = (width - padding * 2) / Math.max(1, data.length - 1);

    const pointsList = data.map((item, index) => {
      const normalized = maxValue === minValue ? 0.5 : (item.value - minValue) / (maxValue - minValue);
      const x = padding + index * xStep;
      const y = height - padding - normalized * (height - padding * 2);
      return { x, y };
    });

    const pathString = pointsList
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
      .join(" ");

    return { path: pathString, points: pointsList };
  }, [data]);

  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
      <h3 style={{ marginBottom: "0.75rem" }}>최근 7일 로딩 시간 추이 (샘플)</h3>
      <svg width="100%" height="200" viewBox="0 0 520 200" style={{ display: "block" }}>
        <rect x="0" y="0" width="520" height="200" fill="#f8fafc" rx="12" />
        <path d={path} stroke="#2563eb" strokeWidth="3" fill="none" />
        {points.map((point, index) => (
          <circle key={chartData[index]?.label} cx={point.x} cy={point.y} r="4" fill="#2563eb" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b" }}>
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <h1>NLQ 검색</h1>
      <p>자연어로 질문하면 매핑된 SQL, 결과, 차트, 예측 리포트를 확인할 수 있습니다.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
        <label htmlFor="query">질문</label>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 로딩 시간이 가장 긴 페이지 TOP 10 알려줘"
            style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "1px solid #ccc" }}
          />
          <button type="submit" style={{ padding: "0.75rem 1.25rem" }}>
            검색
          </button>
        </div>
      </form>

      {submitted && (
        <section style={{ marginTop: "2rem", display: "grid", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {reportCards.map((card) => (
              <div
                key={card.title}
                style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem", background: "#ffffff" }}
              >
                <h2 style={{ marginBottom: "0.5rem" }}>{card.title}</h2>
                <p style={{ margin: 0, color: "#475569" }}>{card.body}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
              <h2>사용 맵 파일</h2>
              <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.75rem" }}>
                {JSON.stringify(sampleMapping, null, 2)}
              </pre>
            </div>

            <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
              <h2>결과 파일</h2>
              <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.75rem" }}>
                {JSON.stringify(sampleResult, null, 2)}
              </pre>
            </div>
          </div>

          <SimpleLineChart data={chartData} />

          <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
            <h2>패턴 인사이트</h2>
            <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
              {patternInsights.map((insight) => (
                <div
                  key={insight.title}
                  style={{
                    borderRadius: 10,
                    padding: "0.75rem",
                    background: "#f8fafc",
                    borderLeft: `6px solid ${severityColors[insight.severity]}`
                  }}
                >
                  <strong>{insight.title}</strong>
                  <p style={{ margin: "0.25rem 0 0", color: "#475569" }}>{insight.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
            <h2>예측 결과</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.75rem" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "0.5rem" }}>날짜</th>
                  <th style={{ padding: "0.5rem" }}>예측값</th>
                  <th style={{ padding: "0.5rem" }}>하한</th>
                  <th style={{ padding: "0.5rem" }}>상한</th>
                </tr>
              </thead>
              <tbody>
                {predictionRows.map((row) => (
                  <tr key={row.date} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.5rem" }}>{row.date}</td>
                    <td style={{ padding: "0.5rem" }}>{row.forecast}</td>
                    <td style={{ padding: "0.5rem" }}>{row.lower}</td>
                    <td style={{ padding: "0.5rem" }}>{row.upper}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
