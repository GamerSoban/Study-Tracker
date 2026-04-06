import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSessions, deleteSession, StudySession } from "@/lib/sessions";
import { SessionCard } from "@/components/SessionCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

const BATCH_SIZE = 15;

const Sessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const refresh = useCallback(() => {
    const all = getSessions();
    all.sort((a, b) => {
      const da = new Date(`${a.date}T${a.startTime}`).getTime();
      const db = new Date(`${b.date}T${b.startTime}`).getTime();
      return db - da;
    });
    setSessions(all);
    setVisibleCount(BATCH_SIZE);
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

  const visibleSessions = useMemo(
    () => sessions.slice(0, visibleCount),
    [sessions, visibleCount]
  );

  const handleScroll = useCallback(() => {
    if (visibleCount >= sessions.length) return;
    const scrollY = window.scrollY + window.innerHeight;
    const docH = document.documentElement.scrollHeight;
    if (scrollY > docH - 400) {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, sessions.length));
    }
  }, [visibleCount, sessions.length]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-bold">All Sessions</h1>
        <Button onClick={() => navigate("/add-session")} size="sm" className="gap-1 rounded-xl">
          <Plus className="w-4 h-4" />
          Log Session
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{sessions.length} sessions logged</p>

      {sessions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No sessions yet. Go log one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSessions.map(s => (
            <SessionCard key={s.id} session={s} onDelete={handleDelete} />
          ))}
          {visibleCount < sessions.length && (
            <p className="text-center text-xs text-muted-foreground py-2">Scroll for more…</p>
          )}
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
