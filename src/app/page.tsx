"use client";
import { minutesToDhm, summarizeIssues } from "@/app/utils/jira";
import { useEffect, useState } from "react";

type SummaryRow = { parentSummary: string; minutes: number };
type ResultType = {
  summary: SummaryRow[];
  total: number;
  personMinutes: Record<string, number>;
  personMinutesByStatus: Record<string, number>;
  authors: string[];
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [project, setProject] = useState("");
  const [fixVersion, setFixVersion] = useState("");
  const [authorsInput, setAuthorsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const [error, setError] = useState("");

  // 입력값을 localStorage에서 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("jiraForm");
    if (saved) {
      const { email, apiToken, project, fixVersion, authorsInput } =
        JSON.parse(saved);
      setEmail(email || "");
      setApiToken(apiToken || "");
      setProject(project || "");
      setFixVersion(fixVersion || "");
      setAuthorsInput(authorsInput || "");
    }
  }, []);

  // 입력값이 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(
      "jiraForm",
      JSON.stringify({ email, apiToken, project, fixVersion, authorsInput })
    );
  }, [email, apiToken, project, fixVersion, authorsInput]);

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const authors = authorsInput
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const authorClause = authors.map((a) => `assignee = ${a}`).join(" or ");
      const jql = `project = ${project} AND fixVersion = "${fixVersion}" AND (${authorClause})`;
      const res = await fetch("/api/jira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jiraUrl: "https://acloset.atlassian.net",
          jql,
          email,
          apiToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API Error");
      setResult(summarizeIssues(data.issues));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center py-10 px-2">
      <div className="w-full max-w-2xl bg-white/95 shadow-xl rounded-2xl p-8 border border-indigo-100 backdrop-blur-md text-gray-900">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-2 flex items-center gap-2">
          <span>🧾</span> 스토리별 할당 시간 요약 도구
        </h1>
        <p className="text-gray-600 mb-6">
          Jira 이슈를 쉽고 빠르게 요약해주는 대시보드
        </p>
        <div className="grid gap-3 mb-6">
          <input
            className="border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
            placeholder="Jira 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            className="border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
            placeholder="Jira API Token"
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            autoComplete="current-password"
          />
          <div className="flex gap-2">
            <input
              className="flex-1 border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
              placeholder="프로젝트 키 (예: AG)"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
            <input
              className="flex-1 border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
              placeholder="Fix Version (예: APP 6.0.0)"
              value={fixVersion}
              onChange={(e) => setFixVersion(e.target.value)}
            />
          </div>
          <input
            className="border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
            placeholder="작성자들을 쉼표로 입력 (예: 최영성, 여진석)"
            value={authorsInput}
            onChange={(e) => setAuthorsInput(e.target.value)}
          />
          <button
            className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold rounded-lg p-3 mt-2 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleFetch}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>{" "}
                불러오는 중...
              </span>
            ) : (
              <span>Jira에서 데이터 가져오기</span>
            )}
          </button>
        </div>
        {error && (
          <div className="text-red-500 mb-4 text-center font-semibold">
            {error}
          </div>
        )}
        {result && (
          <div className="space-y-8 mt-6">
            <section>
              {/* details 태그는 JSX에서 정상적으로 사용 가능, 오류는 일시적이거나 타입 문제일 수 있음. 실제로는 문제 없음 */}
              <details
                open
                className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4 group"
              >
                <summary className="font-semibold cursor-pointer text-indigo-700 text-lg flex items-center gap-2 select-none">
                  <span className="inline-block w-5 h-5 transition-transform duration-200 group-open:rotate-180">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-indigo-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.586 10 7.293 7.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  📊 스토리별 할당시간 (분)
                </summary>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full border-separate border-spacing-0 text-sm rounded-xl overflow-hidden shadow-sm bg-white/80">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-100 to-blue-100">
                        <th className="p-3 font-semibold text-indigo-800 text-left rounded-tl-xl">
                          Parent summary
                        </th>
                        <th className="p-3 font-semibold text-indigo-800 text-right rounded-tr-xl">
                          Minutes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.summary.map((row, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        return (
                          <tr
                            key={row.parentSummary}
                            className={`even:bg-indigo-50 odd:bg-blue-50/60${
                              isLast ? " rounded-b-xl" : ""
                            }`}
                          >
                            <td
                              className={`p-3 text-gray-900 border-b border-indigo-100${
                                isLast ? " rounded-bl-xl border-b-0" : ""
                              }`}
                            >
                              {row.parentSummary}
                            </td>
                            <td
                              className={`p-3 text-right text-gray-900 border-b border-indigo-100${
                                isLast ? " rounded-br-xl border-b-0" : ""
                              }`}
                            >
                              {row.minutes}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>
            <section>
              <details
                open
                className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 group"
              >
                <summary className="font-semibold cursor-pointer text-blue-700 text-lg flex items-center gap-2 select-none">
                  <span className="inline-block w-5 h-5 transition-transform duration-200 group-open:rotate-180">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-blue-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.586 10 7.293 7.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  🧮 총합 및 근무일 기준 포맷
                </summary>
                <div className="mt-2 space-y-1">
                  <div className="text-lg font-bold">
                    🧮 총합: {result.total}분
                  </div>
                  <div className="text-gray-700">
                    - 약 {Math.floor(result.total / 60)}시간 {result.total % 60}
                    분
                  </div>
                  <div className="text-blue-700 font-semibold">
                    - 📅 근무일 기준 포맷:{" "}
                    <b>{minutesToDhm(result.total)}</b>
                  </div>
                </div>
              </details>
            </section>
            <section>
              <details
                open
                className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4 group"
              >
                <summary className="font-semibold cursor-pointer text-indigo-700 text-lg flex items-center gap-2 select-none">
                  <span className="inline-block w-5 h-5 transition-transform duration-200 group-open:rotate-180">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-indigo-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.586 10 7.293 7.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  👤 사람별 할당 시간
                </summary>
                <ul className="mt-2 space-y-1">
                  {Object.entries(result.personMinutes).map(([author, m]) => (
                    <li
                      key={author}
                      className="flex justify-between border-b border-dashed border-indigo-100 py-1"
                    >
                      <span className="font-medium text-indigo-800">
                        {author}
                      </span>
                      <span>
                        {m}분{" "}
                        <span className="text-gray-500">
                          ({minutesToDhm(m)})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </section>
            <section>
              <details className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 group">
                <summary className="font-semibold cursor-pointer text-blue-700 text-lg flex items-center gap-2 select-none">
                  <span className="inline-block w-5 h-5 transition-transform duration-200 group-open:rotate-180">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-blue-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.586 10 7.293 7.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  👤 작업대기/작업중 상태 사람별 할당 시간
                </summary>
                <ul className="mt-2 space-y-1">
                  {Object.entries(result.personMinutesByStatus).map(
                    ([author, m]) => (
                      <li
                        key={author}
                        className="flex justify-between border-b border-dashed border-blue-100 py-1"
                      >
                        <span className="font-medium text-blue-800">
                          {author}
                        </span>
                        <span>
                          {m}분{" "}
                          <span className="text-gray-500">
                            ({minutesToDhm(m)})
                          </span>
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </details>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
