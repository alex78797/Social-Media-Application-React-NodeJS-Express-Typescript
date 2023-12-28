import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

/**
 * @returns A component that protects routes.
 * If user is authenticated, allow the user to access the route, otherwise navigate to login page
 */
export function PrivateOutlet() {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
}
