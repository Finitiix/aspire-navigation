
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2, Home, Users, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthPage } from "@/components/AuthPage";
import { toast } from "sonner";

const AdminNavbar = () => {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
  };

  return (
    <Card className="fixed top-0 left-0 right-0 z-50 rounded-b-lg shadow-md bg-primary">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <UserCircle2 className="w-10 h-10 text-white" />
            <div>
              <p className="font-medium text-white">Admin Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-white"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </Card>
  );
};

const AdminBottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-around">
          <Link
            to="/admin-dashboard"
            className={`flex flex-col items-center ${
              isActive("/admin-dashboard") ? "text-primary" : "text-gray-600"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/admin-dashboard/teachers"
            className={`flex flex-col items-center ${
              isActive("/admin-dashboard/teachers") ? "text-primary" : "text-gray-600"
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">Teachers</span>
          </Link>
          <Link
            to="/admin-dashboard/settings"
            className={`flex flex-col items-center ${
              isActive("/admin-dashboard/settings") ? "text-primary" : "text-gray-600"
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Admin = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <AuthPage role="admin" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Welcome, Admin</h1>
        {/* Content will be added here based on routes */}
      </div>
      <AdminBottomNav />
    </div>
  );
};

export default Admin;
