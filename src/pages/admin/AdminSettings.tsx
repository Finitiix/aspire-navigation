
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const AdminSettings = () => {
  const [teacherEid, setTeacherEid] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [creatingTeacher, setCreatingTeacher] = useState(false);

  const [teacherEmailForReset, setTeacherEmailForReset] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [resetInProgress, setResetInProgress] = useState(false);

  const [currentAdminPassword, setCurrentAdminPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [changingAdminPassword, setChangingAdminPassword] = useState(false);

  const createTeacherUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherEid || !teacherEid.match(/^E\d{5}$/)) {
      toast.error("EID must be in format EXXXXX where X is a digit");
      return;
    }

    if (!teacherPassword || teacherPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setCreatingTeacher(true);

    try {
      // Create email from EID
      const email = `${teacherEid.toLowerCase()}@example.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: teacherPassword,
        options: {
          data: {
            role: 'teacher',
          }
        }
      });

      if (error) throw error;

      toast.success(`Teacher user created: ${teacherEid}`);
      setTeacherEid("");
      setTeacherPassword("");
    } catch (error: any) {
      toast.error(error.message || "Error creating teacher user");
      console.error("Error creating teacher:", error);
    } finally {
      setCreatingTeacher(false);
    }
  };

  const resetTeacherPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherEmailForReset) {
      toast.error("Please enter teacher's EID");
      return;
    }

    if (!teacherEmailForReset.match(/^E\d{5}$/)) {
      toast.error("EID must be in format EXXXXX where X is a digit");
      return;
    }

    if (!newTeacherPassword || newTeacherPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setResetInProgress(true);

    try {
      // For this implementation, we'll do a direct admin update of the user's password
      // In a real app, you'd want to use a more secure process like email verification
      
      // First, need to find the user by their EID (via the email)
      const email = `${teacherEmailForReset.toLowerCase()}@example.com`;
      
      // As an admin, you can update the user's password directly
      const { error } = await supabase.auth.admin.updateUserById(
        'user-id', // You'd need to find the user ID first
        { password: newTeacherPassword }
      );

      if (error) {
        // If admin update fails, fall back to password reset
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
        
        toast.success(`Password reset link sent to ${email}`);
      } else {
        toast.success(`Password updated for ${teacherEmailForReset}`);
      }
      
      setTeacherEmailForReset("");
      setNewTeacherPassword("");
    } catch (error: any) {
      toast.error(error.message || "Error resetting password");
      console.error("Password reset error:", error);
    } finally {
      setResetInProgress(false);
    }
  };

  const changeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAdminPassword) {
      toast.error("Please enter current password");
      return;
    }

    if (!newAdminPassword || newAdminPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingAdminPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newAdminPassword
      });

      if (error) throw error;

      toast.success("Admin password updated successfully");
      setCurrentAdminPassword("");
      setNewAdminPassword("");
      setConfirmAdminPassword("");
    } catch (error: any) {
      toast.error(error.message || "Error changing password");
      console.error("Password change error:", error);
    } finally {
      setChangingAdminPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user-management">
            <TabsList className="mb-4">
              <TabsTrigger value="user-management">User Management</TabsTrigger>
              <TabsTrigger value="password-management">Password Management</TabsTrigger>
              <TabsTrigger value="admin-details">Admin Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user-management">
              <Card>
                <CardHeader>
                  <CardTitle>Create Teacher User</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createTeacherUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacherEid">Teacher EID (EXXXXX)</Label>
                      <Input 
                        id="teacherEid"
                        value={teacherEid}
                        onChange={(e) => setTeacherEid(e.target.value)}
                        placeholder="E12345"
                        pattern="^E\d{5}$"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacherPassword">Password</Label>
                      <Input 
                        id="teacherPassword"
                        type="password"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        placeholder="Password"
                        minLength={6}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={creatingTeacher}>
                      {creatingTeacher ? "Creating..." : "Create Teacher Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password-management">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Admin Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={changeAdminPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword"
                          type="password"
                          value={currentAdminPassword}
                          onChange={(e) => setCurrentAdminPassword(e.target.value)}
                          placeholder="Current Password"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword"
                          type="password"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="New Password"
                          minLength={6}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword"
                          type="password"
                          value={confirmAdminPassword}
                          onChange={(e) => setConfirmAdminPassword(e.target.value)}
                          placeholder="Confirm New Password"
                          minLength={6}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={changingAdminPassword}>
                        {changingAdminPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Reset Teacher Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={resetTeacherPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacherEidForReset">Teacher EID</Label>
                        <Input 
                          id="teacherEidForReset"
                          value={teacherEmailForReset}
                          onChange={(e) => setTeacherEmailForReset(e.target.value)}
                          placeholder="E12345"
                          pattern="^E\d{5}$"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newTeacherPassword">New Password</Label>
                        <Input 
                          id="newTeacherPassword"
                          type="password"
                          value={newTeacherPassword}
                          onChange={(e) => setNewTeacherPassword(e.target.value)}
                          placeholder="New Password"
                          minLength={6}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={resetInProgress}>
                        {resetInProgress ? "Resetting..." : "Reset Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="admin-details">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Account Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Email:</p>
                      <p className="text-sm" id="adminEmail">admin@example.com</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Role:</p>
                      <p className="text-sm">Administrator</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Account Created:</p>
                      <p className="text-sm">March 1, 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
