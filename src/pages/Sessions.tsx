import { useState, useEffect } from "react";
import { getSessions, deleteSession, StudySession } from "@/lib/sessions";
import { SessionCard } from "@/components/SessionCard";
import { toast } from "sonner";

const Sessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);

  const refresh = () => setSessions(getSessions());
  useEffect(refresh, []);

  const handleDelete = (id: string) => {
    deleteSession(id);
    toast.success("Session deleted");
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
    </div>
  );
};

export default Sessions;
