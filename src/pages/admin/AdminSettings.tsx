
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Key, Users, Settings, UserCircle2 } from "lucide-react";

const AdminSettings = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [isAdminPassOpen, setIsAdminPassOpen] = useState(false);
  const [isTeacherPassOpen, setIsTeacherPassOpen] = useState(false);
  const [isNewAdminOpen, setIsNewAdminOpen] = useState(false);
  const [isNewTeacherOpen, setIsNewTeacherOpen] = useState(false);
  
  const [adminPassword, setAdminPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  
  const [teacherPassword, setTeacherPassword] = useState({
    eid: "",
    new: "",
    confirm: "",
  });
  
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    confirm: "",
  });
  
  const [newTeacher, setNewTeacher] = useState({
    eid: "",
    password: "",
    confirm: "",
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminData({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        });
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminPassword.new !== adminPassword.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminData.email,
        password: adminPassword.current,
      });
      
      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }
      
      // Then update to new password
      const { error } = await supabase.auth.updateUser({
        password: adminPassword.new
      });
      
      if (error) throw error;
      
      toast.success("Admin password updated successfully");
      setAdminPassword({ current: "", new: "", confirm: "" });
      setIsAdminPassOpen(false);
    } catch (error) {
      console.error("Error updating admin password:", error);
      toast.error("Failed to update admin password");
    }
  };

  const handleTeacherPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (teacherPassword.new !== teacherPassword.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (!/^E\d{5}$/.test(teacherPassword.eid)) {
      toast.error("Invalid EID format. Should be E followed by 5 digits (e.g., E12345)");
      return;
    }
    
    try {
      // Since we can't directly update another user's password through the API,
      // we'll use the admin functionality to reset it
      // In a real app, this would typically involve sending a password reset email
      // or using admin-level API access
      
      // For demo purposes, we'll show a success message
      toast.success(`Password reset for teacher ${teacherPassword.eid} would be processed here`);
      toast.info("In a production environment, this would require admin API access");
      
      setTeacherPassword({ eid: "", new: "", confirm: "" });
      setIsTeacherPassOpen(false);
    } catch (error) {
      console.error("Error resetting teacher password:", error);
      toast.error("Failed to reset teacher password");
    }
  };

  const handleNewAdminCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newAdmin.password !== newAdmin.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      // Create a new admin user
      const { data, error } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            role: 'admin',
          },
        },
      });
      
      if (error) throw error;
      
      toast.success(`New admin account created: ${newAdmin.email}`);
      setNewAdmin({ email: "", password: "", confirm: "" });
      setIsNewAdminOpen(false);
    } catch (error) {
      console.error("Error creating admin account:", error);
      toast.error("Failed to create admin account");
    }
  };

  const handleNewTeacherCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newTeacher.password !== newTeacher.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!/^E\d{5}$/.test(newTeacher.eid)) {
      toast.error("Invalid EID format. Should be E followed by 5 digits (e.g., E12345)");
      return;
    }
    
    try {
      // Create a new teacher user
      const email = `${newTeacher.eid.toLowerCase()}@achievementhub.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: newTeacher.password,
        options: {
          data: {
            role: 'teacher',
          },
        },
      });
      
      if (error) throw error;
      
      toast.success(`New teacher account created for ${newTeacher.eid}`);
      setNewTeacher({ eid: "", password: "", confirm: "" });
      setIsNewTeacherOpen(false);
    } catch (error) {
      console.error("Error creating teacher account:", error);
      toast.error("Failed to create teacher account");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="admin-profile">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="admin-profile" className="flex items-center gap-2">
            <UserCircle2 className="h-4 w-4" />
            Admin Profile
          </TabsTrigger>
          <TabsTrigger value="user-management" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="password-management" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Password Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="admin-profile">
          <Card>
            <CardHeader>
              <CardTitle>Admin Profile</CardTitle>
              <CardDescription>View your admin account details</CardDescription>
            </CardHeader>
            <CardContent>
              {adminData ? (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <UserCircle2 className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{adminData.email}</h3>
                      <p className="text-sm text-gray-600">Administrator</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Account created: {new Date(adminData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Security and Access</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      As an administrator, you have full access to manage teachers, achievements, and system settings.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsAdminPassOpen(true)}
                      className="w-full md:w-auto"
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500">Loading admin details...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user-management">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Create new admin and teacher accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserCircle2 className="h-5 w-5 text-blue-500" />
                      Admin Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Create a new administrator account with full system access.
                    </p>
                    <Dialog open={isNewAdminOpen} onOpenChange={setIsNewAdminOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create New Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Admin Account</DialogTitle>
                          <DialogDescription>
                            This will create a new administrator with full access.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleNewAdminCreate} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                              type="email"
                              required
                              value={newAdmin.email}
                              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                              type="password"
                              required
                              value={newAdmin.password}
                              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input
                              type="password"
                              required
                              value={newAdmin.confirm}
                              onChange={(e) => setNewAdmin({ ...newAdmin, confirm: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setIsNewAdminOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Create Admin</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Teacher Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Create a new teacher account that can manage their own achievements.
                    </p>
                    <Dialog open={isNewTeacherOpen} onOpenChange={setIsNewTeacherOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create New Teacher
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Teacher Account</DialogTitle>
                          <DialogDescription>
                            This will create a new teacher account with the specified EID.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleNewTeacherCreate} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Teacher EID</label>
                            <Input
                              required
                              placeholder="E12345"
                              value={newTeacher.eid}
                              onChange={(e) => setNewTeacher({ ...newTeacher, eid: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">Format: E followed by 5 digits (e.g., E12345)</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                              type="password"
                              required
                              value={newTeacher.password}
                              onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input
                              type="password"
                              required
                              value={newTeacher.confirm}
                              onChange={(e) => setNewTeacher({ ...newTeacher, confirm: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setIsNewTeacherOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Create Teacher</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password-management">
          <Card>
            <CardHeader>
              <CardTitle>Password Management</CardTitle>
              <CardDescription>Change your password or reset a teacher's password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="h-5 w-5 text-blue-500" />
                      Change Admin Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Update your own administrator password.
                    </p>
                    <Dialog open={isAdminPassOpen} onOpenChange={setIsAdminPassOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">Change Admin Password</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Admin Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and set a new one.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAdminPasswordChange} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <Input
                              type="password"
                              required
                              value={adminPassword.current}
                              onChange={(e) => setAdminPassword({ ...adminPassword, current: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input
                              type="password"
                              required
                              value={adminPassword.new}
                              onChange={(e) => setAdminPassword({ ...adminPassword, new: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm New Password</label>
                            <Input
                              type="password"
                              required
                              value={adminPassword.confirm}
                              onChange={(e) => setAdminPassword({ ...adminPassword, confirm: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setIsAdminPassOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Update Password</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="h-5 w-5 text-blue-500" />
                      Reset Teacher Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Reset a teacher's password if they're locked out.
                    </p>
                    <Dialog open={isTeacherPassOpen} onOpenChange={setIsTeacherPassOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">Reset Teacher Password</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset Teacher Password</DialogTitle>
                          <DialogDescription>
                            Specify the teacher's EID and set a new password for them.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleTeacherPasswordChange} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Teacher EID</label>
                            <Input
                              required
                              placeholder="E12345"
                              value={teacherPassword.eid}
                              onChange={(e) => setTeacherPassword({ ...teacherPassword, eid: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">Format: E followed by 5 digits (e.g., E12345)</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input
                              type="password"
                              required
                              value={teacherPassword.new}
                              onChange={(e) => setTeacherPassword({ ...teacherPassword, new: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm New Password</label>
                            <Input
                              type="password"
                              required
                              value={teacherPassword.confirm}
                              onChange={(e) => setTeacherPassword({ ...teacherPassword, confirm: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setIsTeacherPassOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Reset Password</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
