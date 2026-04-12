import { FirestoreSync } from './firebasePlugins';
import { getSessions, type StudySession } from './sessions';

export class SyncError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'SyncError';
  }
}

function computeHash(sessions: StudySession[]): string {
  const ids = sessions.map(s => s.id).sort().join(',');
  // Simple hash — good enough for change detection
  let hash = 0;
  for (let i = 0; i < ids.length; i++) {
    hash = ((hash << 5) - hash + ids.charCodeAt(i)) | 0;
  }
  return String(hash);
}

const LAST_SYNC_HASH_KEY = 'sync-last-hash';
const LAST_SYNC_TIME_KEY = 'sync-last-time';
const MIN_SYNC_INTERVAL_MS = 30_000; // 30 seconds minimum between syncs

export async function uploadAllSessions(): Promise<void> {
  const sessions = getSessions();
  if (sessions.length === 0) return;
  try {
    const cleanSessions = sessions.map(s => ({
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      actualStudyMinutes: s.actualStudyMinutes ?? 0,
      totalMinutes: s.totalMinutes ?? 0,
      wastedMinutes: s.wastedMinutes ?? 0,
      totalBreakMinutes: s.totalBreakMinutes ?? 0,
      breaks: JSON.stringify(s.breaks || []),
    }));
    await FirestoreSync.uploadSessions({ sessions: cleanSessions });
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('Not authenticated')) throw new SyncError('AUTH', 'You must be signed in to upload sessions.');
    if (msg.includes('PERMISSION_DENIED')) throw new SyncError('PERMISSION', 'Firestore permission denied. Check security rules.');
    if (msg.includes('UNAVAILABLE') || msg.includes('network')) throw new SyncError('NETWORK', 'No internet connection. Please try again later.');
    if (msg.includes('DEADLINE_EXCEEDED') || msg.includes('timeout')) throw new SyncError('TIMEOUT', 'Upload timed out. Try with fewer sessions.');
    throw new SyncError('UPLOAD_FAILED', `Upload failed: ${msg}`);
  }
}

export async function downloadAllSessions(): Promise<StudySession[]> {
  try {
    const result = await FirestoreSync.downloadSessions();
    return (result.sessions || []) as StudySession[];
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('Not authenticated')) throw new SyncError('AUTH', 'You must be signed in to download sessions.');
    if (msg.includes('PERMISSION_DENIED')) throw new SyncError('PERMISSION', 'Firestore permission denied. Check security rules.');
    if (msg.includes('UNAVAILABLE') || msg.includes('network')) throw new SyncError('NETWORK', 'No internet connection. Please try again later.');
    if (msg.includes('DEADLINE_EXCEEDED') || msg.includes('timeout')) throw new SyncError('TIMEOUT', 'Download timed out. Please try again.');
    throw new SyncError('DOWNLOAD_FAILED', `Download failed: ${msg}`);
  }
}

export async function syncSessions(force = false): Promise<{ merged: number; skipped?: boolean }> {
  // Throttle: skip if synced recently and data hasn't changed
  const lastTime = Number(localStorage.getItem(LAST_SYNC_TIME_KEY) || 0);
  const now = Date.now();

  let local: StudySession[];
  try {
    local = getSessions();
  } catch (err: any) {
    throw new SyncError('LOCAL_READ', 'Failed to read local sessions. Storage may be corrupted.');
  }

  if (!force && (now - lastTime) < MIN_SYNC_INTERVAL_MS) {
    const currentHash = computeHash(local);
    const lastHash = localStorage.getItem(LAST_SYNC_HASH_KEY);
    if (currentHash === lastHash) {
      return { merged: local.length, skipped: true };
    }
  }

  let remote: StudySession[];
  try {
    remote = await downloadAllSessions();
  } catch (err) {
    if (err instanceof SyncError) throw err;
    throw new SyncError('DOWNLOAD_FAILED', `Failed to download remote sessions: ${(err as any)?.message}`);
  }

  // Merge: combine local + remote, deduplicate by id
  const merged = new Map<string, StudySession>();
  for (const s of remote) merged.set(s.id, s);
  for (const s of local) merged.set(s.id, s); // local overwrites remote if same id

  const allSessions = Array.from(merged.values())
    .sort((a, b) => b.date.localeCompare(a.date));

  // Check if anything actually changed
  const newHash = computeHash(allSessions);
  const localHash = computeHash(local);
  const remoteHash = computeHash(remote);

  // Save locally
  try {
    localStorage.setItem('study-sessions', JSON.stringify(allSessions));
  } catch (err: any) {
    throw new SyncError('LOCAL_WRITE', 'Failed to save merged sessions locally. Storage may be full.');
  }

  // Only upload if merged differs from remote (avoids unnecessary writes)
  if (newHash !== remoteHash) {
    try {
      const cleanSessions = allSessions.map(s => ({
        id: s.id,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        actualStudyMinutes: s.actualStudyMinutes ?? 0,
        totalMinutes: s.totalMinutes ?? 0,
        wastedMinutes: s.wastedMinutes ?? 0,
        totalBreakMinutes: s.totalBreakMinutes ?? 0,
        breaks: JSON.stringify(s.breaks || []),
      }));
      await FirestoreSync.uploadSessions({ sessions: cleanSessions });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('PERMISSION_DENIED')) throw new SyncError('PERMISSION', 'Firestore permission denied during upload.');
      if (msg.includes('UNAVAILABLE') || msg.includes('network')) throw new SyncError('NETWORK', 'Lost connection during upload. Local data is saved.');
      throw new SyncError('UPLOAD_FAILED', `Upload after merge failed: ${msg}`);
    }
  }

  // Update sync tracking
  localStorage.setItem(LAST_SYNC_HASH_KEY, newHash);
  localStorage.setItem(LAST_SYNC_TIME_KEY, String(now));

  return { merged: allSessions.length };
}

export async function deleteRemoteSession(sessionId: string): Promise<void> {
  try {
    await FirestoreSync.deleteSession({ sessionId });
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('Not authenticated')) throw new SyncError('AUTH', 'Must be signed in to delete remote session.');
    if (msg.includes('PERMISSION_DENIED')) throw new SyncError('PERMISSION', 'Permission denied for remote delete.');
    throw new SyncError('DELETE_FAILED', `Remote delete failed: ${msg}`);
  }
}
