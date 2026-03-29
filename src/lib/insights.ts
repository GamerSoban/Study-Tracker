import { StudySession, getTotals } from "./sessions";

export interface Insight {
  type: "success" | "warning" | "info";
  message: string;
}

export function getSessionInsights(session: StudySession): Insight[] {
  const insights: Insight[] = [];
  const studyPercent = session.totalMinutes > 0 ? (session.actualStudyMinutes / session.totalMinutes) * 100 : 0;
  const wastedPercent = session.totalMinutes > 0 ? (session.wastedMinutes / session.totalMinutes) * 100 : 0;
  const breakPercent = session.totalMinutes > 0 ? ((session.totalBreakMinutes || 0) / session.totalMinutes) * 100 : 0;

  if (studyPercent >= 80) {
    insights.push({ type: "success", message: "Excellent focus! Over 80% of your time was productive." });
  } else if (studyPercent >= 60) {
    insights.push({ type: "info", message: "Decent session — you studied for most of the time." });
  } else if (studyPercent >= 40) {
    insights.push({ type: "warning", message: "Only about half your time was spent studying. Try reducing distractions." });
  } else {
    insights.push({ type: "warning", message: "Low productivity session. Consider shorter, more focused blocks." });
  }

  if (wastedPercent > 30) {
    insights.push({ type: "warning", message: `${Math.round(wastedPercent)}% of this session was wasted time.` });
  }

  if (breakPercent > 40) {
    insights.push({ type: "warning", message: "Breaks took up a large portion of this session. Try shorter breaks." });
  } else if (breakPercent > 0 && breakPercent <= 20) {
    insights.push({ type: "success", message: "Good break balance — enough rest without overdoing it." });
  }

  if (session.totalMinutes > 180) {
    insights.push({ type: "info", message: "Long session! Make sure you're taking enough breaks to stay sharp." });
  }

  if (session.wastedMinutes === 0 && session.totalMinutes > 30) {
    insights.push({ type: "success", message: "Zero wasted time — perfect discipline!" });
  }

  return insights;
}

export function getOverallInsights(sessions: StudySession[]): Insight[] {
  if (sessions.length === 0) return [];

  const insights: Insight[] = [];
  const totals = getTotals(sessions);
  const totalTime = totals.totalStudied + totals.totalWasted + totals.totalBreaks;

  if (totalTime === 0) return insights;

  const studyPercent = (totals.totalStudied / totalTime) * 100;
  const wastedPercent = (totals.totalWasted / totalTime) * 100;
  const breakPercent = (totals.totalBreaks / totalTime) * 100;

  // Overall productivity
  if (studyPercent >= 75) {
    insights.push({ type: "success", message: `Great overall focus! ${Math.round(studyPercent)}% of your time is productive.` });
  } else if (studyPercent >= 50) {
    insights.push({ type: "info", message: `${Math.round(studyPercent)}% productive — there's room to improve your focus.` });
  } else {
    insights.push({ type: "warning", message: `Only ${Math.round(studyPercent)}% of your total time is actual study. Try to minimize distractions.` });
  }

  // Wasted time
  if (wastedPercent > 25) {
    insights.push({ type: "warning", message: `You're wasting ${Math.round(wastedPercent)}% of your session time. Consider using a timer to stay on track.` });
  }

  // Breaks
  if (breakPercent > 30) {
    insights.push({ type: "warning", message: `Breaks account for ${Math.round(breakPercent)}% of your time — try keeping them shorter.` });
  }

  // Averages
  const avgStudy = totals.totalStudied / sessions.length;
  if (avgStudy < 30) {
    insights.push({ type: "info", message: "Your average study time per session is under 30 minutes. Try longer focused blocks." });
  } else if (avgStudy >= 60) {
    insights.push({ type: "success", message: `Averaging ${Math.round(avgStudy)} minutes of study per session — solid commitment!` });
  }

  // Today check
  const today = new Date().toISOString().split("T")[0];
  const todaySessions = sessions.filter(s => s.date === today);
  if (todaySessions.length === 0 && sessions.length > 0) {
    insights.push({ type: "info", message: "No sessions logged today yet — time to get started!" });
  } else if (todaySessions.length >= 3) {
    insights.push({ type: "success", message: `${todaySessions.length} sessions today — you're on a roll!` });
  }

  return insights;
}
