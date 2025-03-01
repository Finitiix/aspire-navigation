
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, Cog, LogOut, MessageSquare } from "lucide-react";

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin-auth");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/admin-auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/admin-auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" className="text-white border-white hover:bg-blue-700" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-4 px-4">
        <Card className="mt-2 mb-20 rounded-xl overflow-hidden">
          <main className="p-6">
            <Outlet />
          </main>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-600 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto flex justify-around">
          <Link to="/admin-dashboard">
            <Button 
              variant={location.pathname === "/admin-dashboard" ? "secondary" : "ghost"} 
              className="flex flex-col items-center text-white hover:bg-blue-700"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs mt-1">Dashboard</span>
            </Button>
          </Link>
          <Link to="/admin-dashboard/teachers">
            <Button 
              variant={location.pathname === "/admin-dashboard/teachers" ? "secondary" : "ghost"}
              className="flex flex-col items-center text-white hover:bg-blue-700"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">Teachers</span>
            </Button>
          </Link>
          <Link to="/admin-dashboard/feedback">
            <Button 
              variant={location.pathname === "/admin-dashboard/feedback" ? "secondary" : "ghost"}
              className="flex flex-col items-center text-white hover:bg-blue-700"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs mt-1">Feedback</span>
            </Button>
          </Link>
          <Link to="/admin-dashboard/settings">
            <Button 
              variant={location.pathname === "/admin-dashboard/settings" ? "secondary" : "ghost"}
              className="flex flex-col items-center text-white hover:bg-blue-700"
            >
              <Cog className="h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Admin;
