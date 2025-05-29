import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { jiraUrl, jql, email, apiToken } = await req.json();
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const url = `${jiraUrl}/rest/api/2/search?jql=${encodeURIComponent(jql)}&fields=summary,parent,timetracking,assignee,status`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Jira API 요청 실패: ${res.status}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ issues: data.issues });
}
