'use client';
import { AppTitle } from "@/app/utils/AppTitle";
import { DetailsSection } from "@/app/utils/DetailsSection";
import { minutesToDhm, summarizeIssues } from "@/app/utils/jira";
import { JiraForm } from "@/app/utils/JiraForm";
import { Sidebar } from "@/app/utils/Sidebar";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type SummaryRow = { parentSummary: string; minutes: number };
type ResultType = {
  summary: SummaryRow[];
  total: number;
  personMinutes: Record<string, number>;
  personMinutesByStatus: Record<string, number>;
  authors: string[];
};

type FormValues = {
  email: string;
  apiToken: string;
  project: string;
  fixVersion: string;
  authorsInput: string;
};

export default function Home() {
  const [result, setResult] = React.useState<ResultType | null>(null);
  const [error, setError] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      apiToken: "",
      project: "",
      fixVersion: "",
      authorsInput: "",
    },
  });

  // localStorage 연동
  React.useEffect(() => {
    const saved = localStorage.getItem("jiraForm");
    if (saved) {
      const values = JSON.parse(saved);
      Object.entries(values).forEach(([k, v]) =>
        setValue(k as keyof FormValues, String(v))
      );
    }
  }, [setValue]);
  React.useEffect(() => {
    const sub = watch((values) => {
      localStorage.setItem("jiraForm", JSON.stringify(values));
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError("");
    setResult(null);
    try {
      const authors = data.authorsInput
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const authorClause = authors.map((a) => `assignee = ${a}`).join(" or ");
      const jql = `project = ${data.project} AND fixVersion = "${data.fixVersion}" AND (${authorClause})`;
      const res = await fetch("/api/jira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jiraUrl: "https://acloset.atlassian.net",
          jql,
          email: data.email,
          apiToken: data.apiToken,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "API Error");
      setResult(summarizeIssues(resData.issues));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)}>
        <AppTitle />
        <form className="grid gap-3 mb-6" onSubmit={handleSubmit(onSubmit)}>
          <JiraForm register={register} loading={isSubmitting} />
        </form>
        {error && (
          <div className="text-red-500 mb-4 text-center font-semibold">
            {error}
          </div>
        )}
      </Sidebar>
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-2">
        {result && (
          <div className="space-y-8 mt-6 w-full max-w-2xl">
            <section>
              <DetailsSection
                open
                borderColorClass="border-indigo-200"
                bgColorClass="bg-indigo-50/60"
                iconColorClass="text-indigo-500"
                summaryClass="text-indigo-700"
                title={<>📊 스토리별 할당시간 (분)</>}
              >
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
              </DetailsSection>
            </section>
            <section>
              <DetailsSection
                open
                borderColorClass="border-blue-200"
                bgColorClass="bg-blue-50/60"
                iconColorClass="text-blue-500"
                summaryClass="text-blue-700"
                title={<>🧮 총합 및 근무일 기준 포맷</>}
              >
                <div className="mt-2 space-y-1">
                  <div className="text-lg font-bold">
                    🧮 총합: {result.total}분
                  </div>
                  <div className="text-gray-700">
                    - 약 {Math.floor(result.total / 60)}시간 {result.total % 60}
                    분
                  </div>
                  <div className="text-blue-700 font-semibold">
                    - 📅 근무일 기준 포맷: <b>{minutesToDhm(result.total)}</b>
                  </div>
                </div>
              </DetailsSection>
            </section>
            <section>
              <DetailsSection
                open
                borderColorClass="border-indigo-200"
                bgColorClass="bg-indigo-50/60"
                iconColorClass="text-indigo-500"
                summaryClass="text-indigo-700"
                title={<>👤 사람별 할당 시간</>}
              >
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
              </DetailsSection>
            </section>
            <section>
              <DetailsSection
                open
                borderColorClass="border-blue-200"
                bgColorClass="bg-blue-50/60"
                iconColorClass="text-blue-500"
                summaryClass="text-blue-700"
                title={<>👤 작업대기/작업중 상태 사람별 할당 시간</>}
              >
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
              </DetailsSection>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
