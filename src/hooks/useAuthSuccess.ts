import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { AuthResponse } from "../types/api";

function useAuthSuccess() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const goTo = location.state?.from ?? "/albums";
    return (result: AuthResponse) => {
        login(result.token, result.user)
        navigate(goTo, { replace: true });

    }

}
export default useAuthSuccess