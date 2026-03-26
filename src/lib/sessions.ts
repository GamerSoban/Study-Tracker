export interface StudySession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  actualStudyMinutes: number;
  totalMinutes: number;
  wastedMinutes: number;
}

const STORAGE_KEY = "study-sessions";

export function getSessions(): StudySession[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addSession(session: Omit<StudySession, "id" | "totalMinutes" | "wastedMinutes">): StudySession {
  const sessions = getSessions();
  const [startH, startM] = session.startTime.split(":").map(Number);
  const [endH, endM] = session.endTime.split(":").map(Number);
  let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  
  const newSession: StudySession = {
    ...session,
    id: crypto.randomUUID(),
    totalMinutes,
    wastedMinutes: Math.max(0, totalMinutes - session.actualStudyMinutes),
  };
  
  sessions.unshift(newSession);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return newSession;
}

export function deleteSession(id: string) {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function getTotals(sessions: StudySession[]) {
  return sessions.reduce(
    (acc, s) => ({
      totalStudied: acc.totalStudied + s.actualStudyMinutes,
      totalWasted: acc.totalWasted + s.wastedMinutes,
      totalSessions: acc.totalSessions + 1,
    }),
    { totalStudied: 0, totalWasted: 0, totalSessions: 0 }
  );
}
