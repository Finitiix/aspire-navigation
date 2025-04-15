import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignIn) {
        const { data: { user }, error } = await supabase.auth.signInWithPassword(formData);
        if (error || !user) throw error || new Error("User not found");

        // ✅ Check if this admin is registered in admin_departments
        const { data: deptAdmin, error: deptError } = await supabase
          .from('admin_departments')
          .select('department_id, is_super_admin')
          .eq('admin_id', user.id)
          .single();

        if (deptError || !deptAdmin) {
          await supabase.auth.signOut();
          throw new Error('Access denied. Not a department admin.');
        }

        // ✅ Save department info for filtering later
        localStorage.setItem("admin_department", deptAdmin.department_id);
        localStorage.setItem("is_super_admin", deptAdmin.is_super_admin ? "true" : "false");

        toast.success('Signed in successfully');
        navigate('/admin-dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        toast.success('Registration successful! Please sign in.');
        setIsSignIn(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isSignIn ? 'Admin Sign In' : 'Admin Registration'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full">
              {isSignIn ? 'Sign In' : 'Register'}
            </Button>
          </form>
          <Button
            variant="link"
            className="mt-4 w-full"
            onClick={() => setIsSignIn(!isSignIn)}
          >
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
