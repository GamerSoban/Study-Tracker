import { useNavigate } from "react-router-dom";
import { AddSessionForm } from "@/components/AddSessionForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AddSession = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-display font-bold">Log Session</h1>
      </div>
      <AddSessionForm onAdded={() => navigate("/")} />
    </div>
  );
};

export default AddSession;
