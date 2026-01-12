import { Clock } from "lucide-react";
import { useGestor } from "@/contexts/GestorContext";

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  }
  return `${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
};

const SessionTimer = () => {
  const { sessionDuration, isLoggedIn } = useGestor();

  if (!isLoggedIn) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium">
      <Clock className="h-4 w-4" />
      <span>{formatDuration(sessionDuration)}</span>
    </div>
  );
};

export default SessionTimer;

export { formatDuration };
