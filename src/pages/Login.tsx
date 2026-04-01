import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GestorLogin from "@/components/GestorLogin";
import { useGestor } from "@/contexts/GestorContext";

const Login = () => {
    const { gestor, isLoggedIn, isAuthLoading } = useGestor();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthLoading && isLoggedIn && gestor?.account_type == null) {
            navigate("/welcome/account-type");
            return;
        }

        if (!isAuthLoading && isLoggedIn) {
            navigate("/dashboard");
        }
    }, [gestor?.account_type, isAuthLoading, isLoggedIn, navigate]);

    if (isAuthLoading || isLoggedIn) {
        return null;
    }

    return <GestorLogin />;
};

export default Login;
