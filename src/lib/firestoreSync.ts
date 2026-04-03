import { FirestoreSync } from './firebasePlugins';
import { getSessions, type StudySession } from './sessions';

export async function uploadAllSessions(): Promise<void> {
  const sessions = getSessions();
  if (sessions.length === 0) return;
  await FirestoreSync.uploadSessions({ sessions });
}

export async function downloadAllSessions(): Promise<StudySession[]> {
  const result = await FirestoreSync.downloadSessions();
  return (result.sessions || []) as StudySession[];
}

export async function syncSessions(): Promise<{ merged: number }> {
  const local = getSessions();
  const remote = await downloadAllSessions();

  // Merge: combine local + remote, deduplicate by id
  const merged = new Map<string, StudySession>();
  for (const s of remote) merged.set(s.id, s);
  for (const s of local) merged.set(s.id, s); // local overwrites remote if same id

  const allSessions = Array.from(merged.values())
    .sort((a, b) => b.date.localeCompare(a.date));

  // Save locally
  localStorage.setItem('study-sessions', JSON.stringify(allSessions));

  // Upload merged set to Firestore
  await FirestoreSync.uploadSessions({ sessions: allSessions });

  return { merged: allSessions.length };
}

export async function deleteRemoteSession(sessionId: string): Promise<void> {
  await FirestoreSync.deleteSession({ sessionId });
}
