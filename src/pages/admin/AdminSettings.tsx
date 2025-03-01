
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AdminSettings = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetchAdminDetails();
  }, []);

  const fetchAdminDetails = async () => {
    try {
      setLoadingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminUser(user);
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create admin user
      const { data, error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (error) throw error;

      toast.success('Admin user created. Check email for confirmation.');
      setAdminEmail('');
      setAdminPassword('');
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('Failed to create admin');
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create teacher user
      const { data, error } = await supabase.auth.signUp({
        email: teacherEmail,
        password: teacherPassword,
        options: {
          data: {
            role: 'teacher'
          }
        }
      });

      if (error) throw error;

      toast.success('Teacher user created. Check email for confirmation.');
      setTeacherEmail('');
      setTeacherPassword('');
    } catch (error) {
      console.error('Error creating teacher:', error);
      toast.error('Failed to create teacher');
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        password: newAdminPassword
      });

      if (error) throw error;

      toast.success('Admin password updated successfully');
      setNewAdminPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="admin-details">
        <TabsList className="mb-6">
          <TabsTrigger value="admin-details">Admin Details</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="password-management">Password Management</TabsTrigger>
        </TabsList>
        
        {/* Admin Details Tab */}
        <TabsContent value="admin-details">
          <Card>
            <CardHeader>
              <CardTitle>Admin Details</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUser ? (
                <p>Loading admin details...</p>
              ) : adminUser ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-lg">{adminUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">User ID</p>
                      <p className="text-lg">{adminUser.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created At</p>
                      <p className="text-lg">{new Date(adminUser.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Sign In</p>
                      <p className="text-lg">{adminUser.last_sign_in_at ? new Date(adminUser.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No admin details found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Management Tab */}
        <TabsContent value="user-management">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Admin Section */}
            <Card>
              <CardHeader>
                <CardTitle>Create Admin User</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Admin</Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Create Teacher Section */}
            <Card>
              <CardHeader>
                <CardTitle>Create Teacher User</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeacher} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Teacher</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Password Management Tab */}
        <TabsContent value="password-management">
          <Card>
            <CardHeader>
              <CardTitle>Change Admin Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
