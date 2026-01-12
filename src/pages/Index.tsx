import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GestorLogin from "@/components/GestorLogin";
import { useGestor } from "@/contexts/GestorContext";

const Index = () => {
  const { isLoggedIn } = useGestor();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn) {
    return null;
  }

  return <GestorLogin />;
};

export default Index;
