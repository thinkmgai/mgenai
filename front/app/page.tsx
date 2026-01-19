"use client";

import { useState } from "react";

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
    ["/checkout", 1.31]
  ]
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>NLQ 검색</h1>
      <p>자연어로 질문하면 매핑된 SQL과 결과를 확인할 수 있습니다.</p>

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
        </section>
      )}
    </main>
  );
}
