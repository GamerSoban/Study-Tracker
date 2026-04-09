import { getSessions, StudySession } from './sessions';

const STORAGE_KEY = "study-sessions";

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function exportSessions(): void {
  const sessions = getSessions();
  if (sessions.length === 0) {
    throw new Error('No sessions to export');
  }
  const headers = ['id','date','startTime','endTime','actualStudyMinutes','totalMinutes','wastedMinutes','totalBreakMinutes','breaks'];
  const rows = sessions.map(s => [
    s.id, s.date, s.startTime, s.endTime,
    String(s.actualStudyMinutes), String(s.totalMinutes),
    String(s.wastedMinutes), String(s.totalBreakMinutes),
    escapeCSV(JSON.stringify(s.breaks))
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `study-sessions-${getLocalDateString()}.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Clean up after a short delay to ensure the download starts
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

export function importSessions(file: File): Promise<{ imported: number; duplicates: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('Empty file');

        const headers = parseCSVLine(lines[0]);
        const imported: StudySession[] = lines.slice(1).map(line => {
          const vals = parseCSVLine(line);
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => obj[h.trim()] = vals[i] || '');
          return {
            id: obj.id,
            date: obj.date,
            startTime: obj.startTime,
            endTime: obj.endTime,
            actualStudyMinutes: Number(obj.actualStudyMinutes),
            totalMinutes: Number(obj.totalMinutes),
            wastedMinutes: Number(obj.wastedMinutes),
            totalBreakMinutes: Number(obj.totalBreakMinutes),
            breaks: JSON.parse(obj.breaks || '[]'),
          } as StudySession;
        });

        if (!imported.every(s => s.id && s.date)) throw new Error('Invalid format');

        const existing = getSessions();
        const existingIds = new Set(existing.map(s => s.id));
        const newSessions = imported.filter(s => !existingIds.has(s.id));
        const merged = [...newSessions, ...existing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

        resolve({ imported: newSessions.length, duplicates: imported.length - newSessions.length });
      } catch {
        reject(new Error('Invalid file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
