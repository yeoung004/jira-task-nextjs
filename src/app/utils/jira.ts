// Jira 이슈 타입 정의
export type JiraIssue = {
  fields: {
    summary: string;
    timetracking?: {
      originalEstimateSeconds?: number;
    };
    parent?: {
      fields?: {
        summary?: string;
        status?: {
          name?: string;
        };
      };
    };
    assignee?: {
      displayName?: string;
      name?: string;
      emailAddress?: string;
    };
    status?: {
      name?: string;
    };
  };
};

// Jira 데이터 요약 및 변환 함수 (Python의 summarize_issues_from_api 역할)
export function summarizeIssues(issues: JiraIssue[]) {
  // Parent summary별로 Minutes 합산
  const summaryMap: Record<string, number> = {};
  const personMinutes: Record<string, number> = {};
  const personMinutesByStatus: Record<string, number> = {};
  const waitingStatuses = ['To Do', '대기', '작업 대기', 'In Progress', '진행중', '진행 중', '작업 중'];

  const authorsSet = new Set<string>();
  const data: { parentSummary: string; minutes: number }[] = [];

  for (const issue of issues) {
    const summary = issue.fields.summary;
    const estimate = issue.fields.timetracking?.originalEstimateSeconds || 0;
    const minutes = estimate ? Math.floor(estimate / 60) : 0;
    const parentSummary = issue.fields.parent?.fields?.summary || summary;
    data.push({ parentSummary, minutes });

    // 사람별 집계용
    const assignee = issue.fields.assignee;
    let assigneeName = '';
    if (assignee) {
      assigneeName = assignee.displayName || assignee.name || assignee.emailAddress || '';
      assigneeName = assigneeName.trim();
      authorsSet.add(assigneeName);
      personMinutes[assigneeName] = (personMinutes[assigneeName] || 0) + minutes;
    }

    // 상태별 집계용
    let statusName = issue.fields.status?.name?.trim() || '';
    if (!statusName && issue.fields.parent) {
      statusName = issue.fields.parent.fields?.status?.name?.trim() || '';
    }
    if (waitingStatuses.includes(statusName) && assigneeName) {
      personMinutesByStatus[assigneeName] = (personMinutesByStatus[assigneeName] || 0) + minutes;
    }
  }

  // summary 집계
  for (const { parentSummary, minutes } of data) {
    summaryMap[parentSummary] = (summaryMap[parentSummary] || 0) + minutes;
  }

  // 모든 author에 대해 personMinutesByStatus에 0 기본값 보장
  for (const author of authorsSet) {
    if (!(author in personMinutesByStatus)) {
      personMinutesByStatus[author] = 0;
    }
  }

  // 총합
  const total = Object.values(summaryMap).reduce((a, b) => a + b, 0);

  return {
    summary: Object.entries(summaryMap).map(([parentSummary, minutes]) => ({ parentSummary, minutes })),
    total,
    personMinutes,
    personMinutesByStatus,
    authors: Array.from(authorsSet),
  };
}

export function minutesToDhm(minutes: number) {
  const days = Math.floor(minutes / (8 * 60));
  const hours = Math.floor((minutes % (8 * 60)) / 60);
  const mins = minutes % 60;
  return `${days}d ${hours}h ${mins}m`;
}
