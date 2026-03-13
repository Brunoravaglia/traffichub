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
    <div className="flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary sm:px-3 sm:text-sm">
      <Clock className="h-4 w-4" />
      <span className="hidden sm:inline">{formatDuration(sessionDuration)}</span>
      <span className="sm:hidden">{formatDuration(sessionDuration).replace(/^0/, "")}</span>
    </div>
  );
};

export default SessionTimer;

export { formatDuration };
