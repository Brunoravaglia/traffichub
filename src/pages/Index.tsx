import { useState, useEffect } from "react";
import PasswordGate from "@/components/PasswordGate";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const unlocked = sessionStorage.getItem("vcd_unlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem("vcd_unlocked", "true");
    setIsUnlocked(true);
  };

  if (!isUnlocked) {
    return <PasswordGate onUnlock={handleUnlock} />;
  }

  return <Dashboard />;
};

export default Index;
