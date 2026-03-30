import { useState, useEffect, useCallback } from "react";
import { getSessions, deleteSession, StudySession } from "@/lib/sessions";
import { SessionCard } from "@/components/SessionCard";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Sessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const all = getSessions();
    all.sort((a, b) => {
      const da = new Date(`${a.date}T${a.startTime}`).getTime();
      const db = new Date(`${b.date}T${b.startTime}`).getTime();
      return db - da;
    });
    setSessions(all);
  }, []);

  useEffect(refresh, [refresh]);

  const handleDelete = useCallback((id: string) => setDeleteId(id), []);

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteSession(deleteId);
    toast.success("Session deleted", { duration: 2000 });
    setDeleteId(null);
    refresh();
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1">All Sessions</h1>
      <p className="text-sm text-muted-foreground mb-6">{sessions.length} sessions logged</p>

      {sessions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No sessions yet. Go log one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <SessionCard key={s.id} session={s} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-card max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete session?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Sessions;
