import { getSessions, StudySession } from './sessions';

const STORAGE_KEY = "study-sessions";

export function exportSessions(): void {
  const sessions = getSessions();
  const data = JSON.stringify(sessions, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `study-sessions-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSessions(file: File): Promise<{ imported: number; duplicates: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as StudySession[];
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        
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
