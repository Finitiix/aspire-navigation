
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const AdminSettings = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherEid, setTeacherEid] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [teacherPasswordChange, setTeacherPasswordChange] = useState({
    eid: "",
    newPassword: ""
  });
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

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
    setLoadingAction(true);
    try {
      // Create admin user with custom email format
      const adminEmailWithDomain = adminEmail.includes('@') 
        ? adminEmail 
        : `${adminEmail}@achievementhub.com`;
        
      const { data, error } = await supabase.auth.signUp({
        email: adminEmailWithDomain,
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
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      if (!validateTeacherEid(teacherEid)) {
        toast.error('Teacher ID must be in format EXXXXX (E followed by 5 digits)');
        setLoadingAction(false);
        return;
      }

      // Create email from teacher ID
      const email = `${teacherEid.toLowerCase()}@achievementhub.com`;
      
      // Create teacher user
      const { data, error } = await supabase.auth.signUp({
        email,
        password: teacherPassword,
        options: {
          data: {
            role: 'teacher'
          }
        }
      });

      if (error) throw error;

      toast.success('Teacher user created. Check email for confirmation.');
      setTeacherEid('');
      setTeacherPassword('');
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      toast.error(error.message || 'Failed to create teacher');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newAdminPassword
      });

      if (error) throw error;

      toast.success('Admin password updated successfully');
      setNewAdminPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleChangeTeacherPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      if (!validateTeacherEid(teacherPasswordChange.eid)) {
        toast.error('Teacher ID must be in format EXXXXX (E followed by 5 digits)');
        setLoadingAction(false);
        return;
      }

      // First, get the teacher's user ID from the EID
      const email = `${teacherPasswordChange.eid.toLowerCase()}@achievementhub.com`;
      
      // Using admin access to update another user's password
      // This requires the service role key, which should be done via a secure function
      // For demonstration, we'll use a direct approach (in production, this should be an edge function)
      const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (userError || !userData?.user) {
        throw new Error(userError?.message || 'Teacher not found with this ID');
      }
      
      const { error } = await supabase.auth.admin.updateUserById(
        userData.user.id,
        { password: teacherPasswordChange.newPassword }
      );

      if (error) throw error;

      toast.success('Teacher password updated successfully');
      setTeacherPasswordChange({ eid: '', newPassword: '' });
    } catch (error: any) {
      console.error('Error updating teacher password:', error);
      toast.error(error.message || 'Failed to update teacher password');
    } finally {
      setLoadingAction(false);
    }
  };

  const validateTeacherEid = (value: string): boolean => {
    return /^E\d{5}$/.test(value);
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
                    <Label htmlFor="admin-email">Username or Email</Label>
                    <Input
                      id="admin-email"
                      type="text"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin-username or full email"
                      required
                      disabled={loadingAction}
                    />
                    <p className="text-xs text-gray-500">
                      If no @ is provided, @achievementhub.com will be added automatically
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      disabled={loadingAction}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loadingAction}>
                    Create Admin
                  </Button>
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
                    <Label htmlFor="teacher-eid">Teacher ID (EID)</Label>
                    <Input
                      id="teacher-eid"
                      type="text"
                      value={teacherEid}
                      onChange={(e) => setTeacherEid(e.target.value)}
                      placeholder="EXXXXX"
                      required
                      disabled={loadingAction}
                    />
                    {teacherEid && !validateTeacherEid(teacherEid) && (
                      <p className="text-red-500 text-sm">
                        Teacher ID must be in format EXXXXX (E followed by 5 digits)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password</Label>
                    <Input
                      id="teacher-password"
                      type="password"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      required
                      disabled={loadingAction}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loadingAction || (teacherEid && !validateTeacherEid(teacherEid))}
                  >
                    Create Teacher
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Email will be automatically created as: {teacherEid.toLowerCase()}@achievementhub.com
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Password Management Tab */}
        <TabsContent value="password-management">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Password Change */}
            <Card>
              <CardHeader>
                <CardTitle>Change Admin Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-admin-password">New Password</Label>
                    <Input
                      id="new-admin-password"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                      disabled={loadingAction}
                    />
                  </div>
                  <Button type="submit" disabled={loadingAction}>
                    Update Admin Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Teacher Password Change */}
            <Card>
              <CardHeader>
                <CardTitle>Change Teacher Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangeTeacherPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-eid-password">Teacher ID (EID)</Label>
                    <Input
                      id="teacher-eid-password"
                      type="text"
                      value={teacherPasswordChange.eid}
                      onChange={(e) => setTeacherPasswordChange({ ...teacherPasswordChange, eid: e.target.value })}
                      placeholder="EXXXXX"
                      required
                      disabled={loadingAction}
                    />
                    {teacherPasswordChange.eid && !validateTeacherEid(teacherPasswordChange.eid) && (
                      <p className="text-red-500 text-sm">
                        Teacher ID must be in format EXXXXX (E followed by 5 digits)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-teacher-password">New Password</Label>
                    <Input
                      id="new-teacher-password"
                      type="password"
                      value={teacherPasswordChange.newPassword}
                      onChange={(e) => setTeacherPasswordChange({ ...teacherPasswordChange, newPassword: e.target.value })}
                      required
                      disabled={loadingAction}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={
                      loadingAction || 
                      (teacherPasswordChange.eid && !validateTeacherEid(teacherPasswordChange.eid))
                    }
                  >
                    Update Teacher Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
