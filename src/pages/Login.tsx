import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GestorLogin from "@/components/GestorLogin";
import { useGestor } from "@/contexts/GestorContext";

const Login = () => {
    const { isLoggedIn, clearAgencySelection } = useGestor();
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
        if (isLoggedIn) {
            navigate("/dashboard");
        }
    }, [isLoggedIn, navigate]);

    if (isLoggedIn) {
        return null;
    }

    return <GestorLogin />;
};

export default Login;
