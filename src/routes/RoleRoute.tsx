import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

type RoleRouteProps = {
    allowedRoles: string[];
    children: React.ReactNode;
};

function RoleRoute({
    allowedRoles,
    children,
} : RoleRouteProps) {

    const { role } = useAuth();

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;

}

export default RoleRoute;