import React from "react";
import { UseFormRegister } from "react-hook-form";

interface JiraFormProps {
  register: UseFormRegister<{
    email: string;
    apiToken: string;
    project: string;
    fixVersion: string;
    authorsInput: string;
  }>;
  loading: boolean;
}

export function JiraForm({ register, loading }: JiraFormProps) {
  return (
    <>
      <input
        className="border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
        placeholder="Jira 이메일"
        {...register("email")}
        autoComplete="username"
      />
      <input
        className="border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
        placeholder="Jira API Token"
        type="password"
        {...register("apiToken")}
        autoComplete="current-password"
      />
      <div className="flex gap-2">
        <input
          className="flex-1 border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
          placeholder="프로젝트 키 (예: AG)"
          {...register("project")}
        />
        <input
          className="flex-1 border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
          placeholder="Fix Version (예: APP 6.0.0)"
          {...register("fixVersion")}
        />
      </div>
      <input
        className="border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition p-3 rounded-lg bg-white/80 placeholder:text-gray-400 text-gray-900"
        placeholder="작성자들을 쉼표로 입력 (예: 최영성, 여진석)"
        {...register("authorsInput")}
      />
      <button
        className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold rounded-lg p-3 mt-2 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
        type="submit"
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
    </>
  );
}
