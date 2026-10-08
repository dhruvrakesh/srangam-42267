import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading, roleChecked } = useAuth();
  const location = useLocation();

  // AUTH_ROLE_2026_10_08: wait for the role as well as the session. Deciding while the has_role
  // answer was still on its way sent an admin to /auth and back after every sign-in.
  if (isLoading || (user && !roleChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Checking access">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Phase N.5 — admin-only gate (server-backed via has_role RPC).
  if (!user) {
    // AUTH_ROLE_2026_10_08: after signing in, come back to the admin page that was asked for.
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  // AUTH_ROLE_2026_10_08: a signed-in account that is not an admin is told so here. Sending it to
  // /auth looped: /auth sends a signed-in user on to /admin/tags, which sent it back to /auth.
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold">This area is for the site's editors</h1>
          <p className="text-muted-foreground">You are signed in, but this account is not an editor's.</p>
          <p className="flex justify-center gap-6">
            <Link to="/corpus" className="text-primary hover:underline">Read the working corpus</Link>
            <Link to="/" className="text-primary hover:underline">Home</Link>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
