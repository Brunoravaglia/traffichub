import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GestorLogin from "@/components/GestorLogin";
import { useGestor } from "@/contexts/GestorContext";

const Login = () => {
    const { isLoggedIn, isAuthLoading } = useGestor();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthLoading && isLoggedIn) {
            navigate("/dashboard");
        }
    }, [isAuthLoading, isLoggedIn, navigate]);

    if (isAuthLoading || isLoggedIn) {
        return null;
    }

    return <GestorLogin />;
};

export default Login;
