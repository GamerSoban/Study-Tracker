import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSession } from "@/lib/sessions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onAdded: () => void;
}

export function AddSessionForm({ onAdded }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [studyHours, setStudyHours] = useState("");
  const [studyMins, setStudyMins] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actualMinutes = (parseInt(studyHours || "0") * 60) + parseInt(studyMins || "0");
    
    if (!startTime || !endTime) {
      toast.error("Please fill in start and end times");
      return;
    }
    if (actualMinutes <= 0) {
      toast.error("Study time must be greater than 0");
      return;
    }

    addSession({ date, startTime, endTime, actualStudyMinutes: actualMinutes });
    toast.success("Session logged!");
    setStartTime("");
    setEndTime("");
    setStudyHours("");
    setStudyMins("");
    onAdded();
  };

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

      <Button type="submit" className="w-full gap-2 rounded-xl h-12 text-base font-semibold">
        <Plus className="w-5 h-5" />
        Log Session
      </Button>
    </form>
  );
}
