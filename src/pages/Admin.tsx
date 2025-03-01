
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LogOut, UserCircle2, Home, Users, Settings, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin-auth');
        return;
      }

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        navigate('/');
        return;
      }

      setAdminData({
        email: user.email,
        name: user.email?.split('@')[0] || 'Admin'
      });
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/admin-auth');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setNewPassword('');
      setIsChangePasswordOpen(false);
    } catch (error) {
      toast.error('Error updating password');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Updated with blue color and rounded edges */}
      <nav className="fixed top-0 left-0 right-0 bg-[#1EAEDB] text-white border-b z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin-dashboard" className="text-xl font-bold text-white">
                Admin Panel
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white text-[#1EAEDB] flex items-center justify-center">
                  <UserCircle2 className="w-5 h-5" />
                </div>
                <span>Welcome, {adminData?.name}!</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white text-[#1EAEDB] hover:bg-gray-100">Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Button type="submit">Update Password</Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" onClick={handleSignOut} className="text-white hover:bg-[#0FA0CE]">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Added margin for gap */}
      <main className="pt-20 pb-20 px-4">
        <Card className="rounded-lg overflow-hidden shadow-md mt-4 mx-4">
          <Outlet />
        </Card>
      </main>

      {/* Bottom Navigation - Updated with blue color and added Feedback tab */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1EAEDB] text-white border-t z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            <Link
              to="/admin-dashboard"
              className={`flex flex-col items-center ${
                location.pathname === '/admin-dashboard' ? 'text-white font-bold' : 'text-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              to="/admin-dashboard/teachers"
              className={`flex flex-col items-center ${
                location.pathname === '/admin-dashboard/teachers' ? 'text-white font-bold' : 'text-gray-100'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">Teachers</span>
            </Link>
            <Link
              to="/admin-dashboard/feedback"
              className={`flex flex-col items-center ${
                location.pathname === '/admin-dashboard/feedback' ? 'text-white font-bold' : 'text-gray-100'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs mt-1">Feedback</span>
            </Link>
            <Link
              to="/admin-dashboard/settings"
              className={`flex flex-col items-center ${
                location.pathname === '/admin-dashboard/settings' ? 'text-white font-bold' : 'text-gray-100'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Admin;
