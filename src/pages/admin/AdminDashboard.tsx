import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2, Home, Users, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/admin");
        return;
      }
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/admin");
        return;
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="h-20 pt-4 px-4">
        <Card className="fixed top-4 left-4 right-4 z-50 rounded-lg shadow-md bg-primary">
          <div className="container mx-auto px-6">
            <div className="h-20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserCircle2 className="w-12 h-12 text-white" />
                <p className="text-xl font-medium text-white">Admin Dashboard</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-white"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Total Teachers</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Active Teachers</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Departments</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="h-20 flex items-center justify-around">
            <Link
              to="/admin-dashboard"
              className="flex flex-col items-center text-primary"
            >
              <Home className="w-7 h-7" />
              <span className="text-sm mt-1">Home</span>
            </Link>
            <Link
              to="/admin-dashboard/teachers"
              className="flex flex-col items-center text-gray-600"
            >
              <Users className="w-7 h-7" />
              <span className="text-sm mt-1">Teachers</span>
            </Link>
            <Link
              to="/admin-dashboard/settings"
              className="flex flex-col items-center text-gray-600"
            >
              <Settings className="w-7 h-7" />
              <span className="text-sm mt-1">Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
