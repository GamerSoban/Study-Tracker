import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSession, calculateSessionStats, formatMinutes, Break } from "@/lib/sessions";
import { Plus, Trash2, Coffee, AlertTriangle, Clock, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { getLocalDateString } from "@/lib/utils";

interface Props {
  onAdded: () => void;
}

export function AddSessionForm({ onAdded }: Props) {
  const [date, setDate] = useState(getLocalDateString());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [studyHours, setStudyHours] = useState("");
  const [studyMins, setStudyMins] = useState("");
  const [breaks, setBreaks] = useState<Break[]>([]);

  const actualMinutes = (parseInt(studyHours || "0") * 60) + parseInt(studyMins || "0");

  const liveStats = useMemo(() => {
    return calculateSessionStats(startTime, endTime, actualMinutes, breaks);
  }, [startTime, endTime, actualMinutes, breaks]);

  const addBreak = () => {
    setBreaks([...breaks, { startTime: "", durationMinutes: 0 }]);
  };

  const updateBreak = (index: number, field: keyof Break, value: string | number) => {
    const updated = [...breaks];
    updated[index] = { ...updated[index], [field]: value };
    setBreaks(updated);
  };

  const removeBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startTime || !endTime) {
      toast.error("Please fill in start and end times");
      return;
    }
    if (actualMinutes <= 0) {
      toast.error("Study time must be greater than 0");
      return;
    }

    addSession({ date, startTime, endTime, actualStudyMinutes: actualMinutes, breaks });
    toast.success("Session logged!", { duration: 2000 });
    setStartTime("");
    setEndTime("");
    setStudyHours("");
    setStudyMins("");
    setBreaks([]);
    onAdded();
  };

  const hasTimeInputs = startTime && endTime;

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4 animate-fade-in">
      <h2 className="text-lg font-display font-semibold">Log Session</h2>

      <div>
        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 bg-secondary border-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Start Time</Label>
          <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 bg-secondary border-border" />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">End Time</Label>
          <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 bg-secondary border-border" />
        </div>
      </div>

      <div>
        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Actual Study Time</Label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <Input type="number" min="0" placeholder="Hours" value={studyHours} onChange={e => setStudyHours(e.target.value)} className="bg-secondary border-border" />
          <Input type="number" min="0" max="59" placeholder="Minutes" value={studyMins} onChange={e => setStudyMins(e.target.value)} className="bg-secondary border-border" />
        </div>
      </div>

      {/* Breaks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Breaks</Label>
          <Button type="button" variant="outline" size="sm" onClick={addBreak} className="gap-1 text-xs h-7 rounded-lg border-border">
            <Coffee className="w-3 h-3" />
            Add Break
          </Button>
        </div>

        {breaks.map((b, i) => (
          <div key={i} className="flex items-end gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
            <div className="flex-1">
              <Label className="text-muted-foreground text-[10px] uppercase tracking-wider">When</Label>
              <Input
                type="time"
                value={b.startTime}
                onChange={e => updateBreak(i, "startTime", e.target.value)}
                className="mt-0.5 bg-secondary border-border h-8 text-sm"
              />
            </div>
            <div className="w-20">
              <Label className="text-muted-foreground text-[10px] uppercase tracking-wider">Mins</Label>
              <Input
                type="number"
                min="0"
                value={b.durationMinutes || ""}
                onChange={e => updateBreak(i, "durationMinutes", parseInt(e.target.value) || 0)}
                className="mt-0.5 bg-secondary border-border h-8 text-sm"
              />
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-wasted shrink-0" onClick={() => removeBreak(i)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Live Calculation */}
      {hasTimeInputs && (
        <div className="rounded-xl bg-secondary/50 border border-border p-4 space-y-2 animate-fade-in">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Live Preview</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-semibold ml-auto">{formatMinutes(liveStats.totalMinutes)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-studied" />
              <span className="text-xs text-muted-foreground">Study</span>
              <span className="text-sm font-semibold text-studied ml-auto">{formatMinutes(actualMinutes)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Breaks</span>
              <span className="text-sm font-semibold text-primary ml-auto">{formatMinutes(liveStats.totalBreakMinutes)}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-wasted" />
              <span className="text-xs text-muted-foreground">Wasted</span>
              <span className="text-sm font-semibold text-wasted ml-auto">{formatMinutes(liveStats.wastedMinutes)}</span>
            </div>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full gap-2 rounded-xl h-12 text-base font-semibold">
        <Plus className="w-5 h-5" />
        Log Session
      </Button>
    </form>
  );
}
