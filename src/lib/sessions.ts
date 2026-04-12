import { syncWidgetData } from './widget';

export interface Break {
  startTime: string;
  durationMinutes: number;
}

export interface StudySession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  actualStudyMinutes: number;
  totalMinutes: number;
  wastedMinutes: number;
  breaks: Break[];
  totalBreakMinutes: number;
}

const STORAGE_KEY = "study-sessions";

export function getSessions(): StudySession[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function calculateSessionStats(
  startTime: string,
  endTime: string,
  actualStudyMinutes: number,
  breaks: Break[]
) {
  if (!startTime || !endTime) return { totalMinutes: 0, totalBreakMinutes: 0, wastedMinutes: 0 };
  
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  
  const totalBreakMinutes = breaks.reduce((sum, b) => sum + (b.durationMinutes || 0), 0);
  const wastedMinutes = Math.max(0, totalMinutes - actualStudyMinutes - totalBreakMinutes);
  
  return { totalMinutes, totalBreakMinutes, wastedMinutes };
}

export function addSession(session: {
  date: string;
  startTime: string;
  endTime: string;
  actualStudyMinutes: number;
  breaks: Break[];
}): StudySession {
  const sessions = getSessions();
  const { totalMinutes, totalBreakMinutes, wastedMinutes } = calculateSessionStats(
    session.startTime,
    session.endTime,
    session.actualStudyMinutes,
    session.breaks
  );
  
  const newSession: StudySession = {
    ...session,
    id: crypto.randomUUID(),
    totalMinutes,
    totalBreakMinutes,
    wastedMinutes,
  };
  
  sessions.unshift(newSession);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  syncWidgetData();
  // Auto-sync to cloud (fire and forget)
  import('./firestoreSync').then(m => m.syncSessions(true)).catch(() => {});
  return newSession;
}

export function deleteSession(id: string) {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  syncWidgetData();
  // Attempt remote delete (fire and forget — works only when logged in on native)
  import('./firestoreSync').then(m => m.deleteRemoteSession(id)).catch(() => {});
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
      totalBreaks: acc.totalBreaks + (s.totalBreakMinutes || 0),
      totalSessions: acc.totalSessions + 1,
    }),
    { totalStudied: 0, totalWasted: 0, totalBreaks: 0, totalSessions: 0 }
  );
}
