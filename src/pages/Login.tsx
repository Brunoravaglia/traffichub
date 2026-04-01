import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GestorLogin from "@/components/GestorLogin";
import { useGestor } from "@/contexts/GestorContext";

const Login = () => {
    const { gestor, isLoggedIn, isAuthLoading, clearAgencySelection } = useGestor();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const shouldResetAgency = searchParams.get("resetAgency") === "1";

    useEffect(() => {
        if (!shouldResetAgency) {
            return;
        }

        clearAgencySelection();
        navigate("/login", { replace: true });
    }, [clearAgencySelection, navigate, shouldResetAgency]);

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
