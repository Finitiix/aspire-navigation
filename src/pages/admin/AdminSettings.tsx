
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { MultiSelect, Option } from "@/components/ui/multi-select";

// Define interface for admin_departments table
interface AdminDepartment {
  admin_id: string;
  department_id: string;
  is_super_admin: boolean;
}

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
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetchAdminDetails();
    fetchDepartments();
  }, []);

  const fetchAdminDetails = async () => {
    try {
      setLoadingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminUser(user);
        
        const { data: adminDepts } = await supabase
          .from('admin_departments')
          .select('is_super_admin')
          .eq('admin_id', user.id);
        
        if (adminDepts && Array.isArray(adminDepts) && adminDepts.length > 0) {
          setIsSuperAdmin(adminDepts.some(dept => dept.is_super_admin));
        }
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      if (data) {
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    
    if (selectedDepartments.length === 0) {
      toast.error('Please select at least one department');
      setLoadingAction(false);
      return;
    }

    try {
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

      if (data.user) {
        // Create entries in admin_departments for each selected department
        for (const deptId of selectedDepartments) {
          const { error: deptError } = await supabase
            .from('admin_departments')
            .insert({
              admin_id: data.user.id,
              department_id: deptId,
              is_super_admin: false
            });

          if (deptError) throw deptError;
        }

        toast.success('Department admin created successfully. Check email for confirmation.');
        setAdminEmail('');
        setAdminPassword('');
        setSelectedDepartments([]);
      }
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

      const email = `${teacherEid.toLowerCase()}@achievementhub.com`;
      
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

      const email = `${teacherPasswordChange.eid.toLowerCase()}@achievementhub.com`;
      
      const { data: userData, error: userError } = await supabase
        .from('auth_users_view')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        throw new Error(userError?.message || 'Teacher not found with this ID');
      }
      
      const { error } = await supabase.auth.admin.updateUserById(
        userData.id,
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

  if (!loadingUser && !isSuperAdmin) {
    return (
      <div className="p-6">
        <Tabs defaultValue="admin-details">
          <TabsList className="mb-6">
            <TabsTrigger value="admin-details">Admin Details</TabsTrigger>
            <TabsTrigger value="user-management">User Management</TabsTrigger>
            <TabsTrigger value="password-management">Password Management</TabsTrigger>
          </TabsList>
          
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
                      <div>
                        <p className="text-sm font-medium">Access Level</p>
                        <p className="text-lg">Department Admin</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No admin details found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="user-management">
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
          </TabsContent>
          
          <TabsContent value="password-management">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    )
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="admin-details">
        <TabsList className="mb-6">
          <TabsTrigger value="admin-details">Admin Details</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="password-management">Password Management</TabsTrigger>
        </TabsList>
        
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
                    <div>
                      <p className="text-sm font-medium">Access Level</p>
                      <p className="text-lg text-green-600 font-medium">Super Admin</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No admin details found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user-management">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Department Admin</CardTitle>
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
                  <div className="space-y-2">
                    <Label htmlFor="admin-departments">Department Access</Label>
                    {departments.length > 0 ? (
                      <div className="pt-1">
                        <MultiSelect
                          options={departments.map(dept => ({
                            label: dept.name,
                            value: dept.id
                          }))}
                          selected={selectedDepartments}
                          onChange={setSelectedDepartments}
                          placeholder="Select departments..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Admin will only have access to selected departments
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600">Loading departments...</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loadingAction || selectedDepartments.length === 0}
                  >
                    Create Department Admin
                  </Button>
                </form>
              </CardContent>
            </Card>
            
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
        
        <TabsContent value="password-management">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
