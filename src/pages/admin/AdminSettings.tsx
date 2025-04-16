import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DepartmentSelect } from "@/components/ui/department-select";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, UserCheck, ShieldAlert, Shield } from "lucide-react";
import { Trash2 } from "lucide-react";

interface AdminDepartment {
  admin_id: string;
  department_id: string;
  is_super_admin: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  departments: string[];
  is_super_admin: boolean;
}

const DEPARTMENT_LIST = [
  { label: "1st Year", value: "1st Year" },
  { label: "CSE 2nd Year", value: "CSE 2nd Year" },
  { label: "CSE 3rd Year", value: "CSE 3rd Year" },
  { label: "CSE 4th Year", value: "CSE 4th Year" },
  { label: "UIC, BCA 1st Year", value: "UIC, BCA 1st Year" },
  { label: "UIC, BCA 2nd Year", value: "UIC, BCA 2nd Year" },
  { label: "UIC, BCA 3rd Year", value: "UIC, BCA 3rd Year" },
  { label: "UIC, MCA 1st Year", value: "UIC, MCA 1st Year" },
  { label: "UIC, MCA 2nd Year", value: "UIC, MCA 2nd Year" },
  { label: "AIT CSE AI/ML 2nd Year", value: "AIT CSE AI/ML 2nd Year" },
  { label: "AIT CSE AI/ML 3rd Year", value: "AIT CSE AI/ML 3rd Year" },
  { label: "AIT CSE AI/ML 4th Year", value: "AIT CSE AI/ML 4th Year" },
  { label: "AIT CSE NON AI/ML 2nd Year", value: "AIT CSE NON AI/ML 2nd Year" },
  { label: "AIT CSE NON AI/ML 3rd Year", value: "AIT CSE NON AI/ML 3rd Year" },
  { label: "AIT CSE NON AI/ML 4th Year", value: "AIT CSE NON AI/ML 4th Year" },
  { label: "NON-CSE 2nd Year", value: "NON-CSE 2nd Year" },
  { label: "NON-CSE 3rd Year", value: "NON-CSE 3rd Year" },
  { label: "NON-CSE 4th Year", value: "NON-CSE 4th Year" },
  { label: "ME-NON-CSE 1st Year", value: "ME-NON-CSE 1st Year" },
  { label: "ME-NON-CSE 2nd Year", value: "ME-NON-CSE 2nd Year" },
  { label: "ME CSE 1st Year", value: "ME CSE 1st Year" },
  { label: "ME CSE 2nd Year", value: "ME CSE 2nd Year" },
  { label: "PhD CSE", value: "PhD CSE" },
  { label: "PhD NON-CSE", value: "PhD NON-CSE" }
];

const AdminSettings = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [superAdminEmail, setSuperAdminEmail] = useState("");
  const [superAdminPassword, setSuperAdminPassword] = useState("");
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
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageForDepartment, setMessageForDepartment] = useState<string>("all");
  const [detailText, setDetailText] = useState("");
  const [detailForDepartment, setDetailForDepartment] = useState<string>("all");
  const [messages, setMessages] = useState<any[]>([]);
  const [details, setDetails] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchAdminDetails();
    fetchAdminUsers();
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

        setDepartments(DEPARTMENT_LIST.map(dept => ({ 
          id: dept.value, 
          name: dept.label 
        })));
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      setLoadingAdmins(true);
      
      const { data: adminProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'admin');
      
      if (profilesError) throw profilesError;

      if (adminProfiles && adminProfiles.length > 0) {
        const admins: AdminUser[] = [];
        
        for (const profile of adminProfiles) {
          const { data: userData, error: userError } = await supabase
            .from('auth_users_view')
            .select('email')
            .eq('id', profile.id)
            .single();
          
          if (userError) console.error('Error fetching admin user data:', userError);
          
          const { data: deptData, error: deptError } = await supabase
            .from('admin_departments')
            .select('department_id, is_super_admin')
            .eq('admin_id', profile.id);
          
          if (deptError) console.error('Error fetching admin departments:', deptError);
          
          const isSuperAdmin = deptData ? deptData.some(dept => dept.is_super_admin) : false;
          const departments = deptData ? deptData.map(dept => dept.department_id) : [];
          
          admins.push({
            id: profile.id,
            email: userData?.email || 'Unknown email',
            departments,
            is_super_admin: isSuperAdmin
          });
        }
        
        setAdminUsers(admins);
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoadingAdmins(false);
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
        fetchAdminUsers();
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    
    try {
      const superAdminEmailWithDomain = superAdminEmail.includes('@') 
        ? superAdminEmail 
        : `${superAdminEmail}@achievementhub.com`;
        
      const { data, error } = await supabase.auth.signUp({
        email: superAdminEmailWithDomain,
        password: superAdminPassword,
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: deptError } = await supabase
          .from('admin_departments')
          .insert({
            admin_id: data.user.id,
            department_id: 'all',
            is_super_admin: true
          });

        if (deptError) throw deptError;

        toast.success('Super admin created successfully. Check email for confirmation.');
        setSuperAdminEmail('');
        setSuperAdminPassword('');
        fetchAdminUsers();
      }
    } catch (error: any) {
      console.error('Error creating super admin:', error);
      toast.error(error.message || 'Failed to create super admin');
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

  const getDepartmentNames = (departmentIds: string[]): string => {
    if (!departmentIds || departmentIds.length === 0) return 'None';
    if (departmentIds.includes('all')) return 'All Departments';
    
    const deptNames = departmentIds.map(id => {
      const dept = DEPARTMENT_LIST.find(d => d.value === id);
      return dept ? dept.label : id;
    });
    
    return deptNames.join(', ');
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from('important_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('important_details')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setDetails(data || []);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Failed to load details');
    }
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      
      const newMessage = {
        message: messageText,
        department: messageForDepartment === "all" ? null : messageForDepartment
      };
      
      const { error } = await supabase
        .from('important_messages')
        .insert(newMessage);
        
      if (error) throw error;
      
      toast.success('Message added successfully');
      setMessageText('');
      setMessageForDepartment('all');
      fetchMessages();
    } catch (error) {
      console.error('Error adding message:', error);
      toast.error('Failed to add message');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      
      const newDetail = {
        detail: detailText,
        department: detailForDepartment === "all" ? null : detailForDepartment
      };
      
      const { error } = await supabase
        .from('important_details')
        .insert(newDetail);
        
      if (error) throw error;
      
      toast.success('Detail added successfully');
      setDetailText('');
      setDetailForDepartment('all');
      fetchDetails();
    } catch (error) {
      console.error('Error adding detail:', error);
      toast.error('Failed to add detail');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      setLoadingAction(true);
      
      const { error } = await supabase
        .from('important_messages')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Message deleted successfully');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteDetail = async (id: string) => {
    try {
      setLoadingAction(true);
      
      const { error } = await supabase
        .from('important_details')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Detail deleted successfully');
      fetchDetails();
    } catch (error) {
      console.error('Error deleting detail:', error);
      toast.error('Failed to delete detail');
    } finally {
      setLoadingAction(false);
    }
  };

  if (!loadingUser && !isSuperAdmin) {
    return (
      <div className="p-6">
        <Tabs defaultValue="admin-details">
          <TabsList className="mb-6">
            <TabsTrigger value="admin-details">Admin Details</TabsTrigger>
            <TabsTrigger value="user-management">User Management</TabsTrigger>
            <TabsTrigger value="password-management">Password Management</TabsTrigger>
            <TabsTrigger value="message-management">Message Management</TabsTrigger>
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
                        <p className="text-lg text-green-600 font-medium">Department Admin</p>
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
          
          <TabsContent value="message-management">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Important Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMessage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="message-text">Message</Label>
                      <Input
                        id="message-text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Enter important message"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message-department">Department</Label>
                      <Select
                        value={messageForDepartment}
                        onValueChange={setMessageForDepartment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {DEPARTMENT_LIST.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={loadingAction}>
                      {loadingAction ? "Adding..." : "Add Message"}
                    </Button>
                  </form>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Current Messages</h3>
                    {loadingMessages ? (
                      <p>Loading messages...</p>
                    ) : (
                      <div className="space-y-3">
                        {messages.length > 0 ? (
                          messages.map((msg) => (
                            <div key={msg.id} className="p-3 border rounded-md flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">{msg.message}</p>
                                <p className="text-xs text-gray-500">
                                  Department: {msg.department || 'All Departments'}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteMessage(msg.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No messages available</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Important Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddDetail} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="detail-text">Detail</Label>
                      <Input
                        id="detail-text"
                        value={detailText}
                        onChange={(e) => setDetailText(e.target.value)}
                        placeholder="Enter important detail"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="detail-department">Department</Label>
                      <Select
                        value={detailForDepartment}
                        onValueChange={setDetailForDepartment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {DEPARTMENT_LIST.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={loadingAction}>
                      {loadingAction ? "Adding..." : "Add Detail"}
                    </Button>
                  </form>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Current Details</h3>
                    <div className="space-y-3">
                      {details.length > 0 ? (
                        details.map((detail) => (
                          <div key={detail.id} className="p-3 border rounded-md flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">{detail.detail}</p>
                              <p className="text-xs text-gray-500">
                                Department: {detail.department || 'All Departments'}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteDetail(detail.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No details available</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="admin-details">
        <TabsList className="mb-6">
          <TabsTrigger value="admin-details">Admin Details</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="password-management">Password Management</TabsTrigger>
          <TabsTrigger value="admin-list">Admin List</TabsTrigger>
          <TabsTrigger value="message-management">Message Management</TabsTrigger>
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
                    <div className="pt-1">
                      <DepartmentSelect
                        options={DEPARTMENT_LIST}
                        selected={selectedDepartments}
                        onChange={setSelectedDepartments}
                        placeholder="Select departments..."
                      />
                      {isSuperAdmin ? (
                        <p className="text-xs text-gray-500 mt-1">
                          As super admin, you can assign any departments to this admin
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          Admin will only have access to selected departments
                        </p>
                      )}
                    </div>
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
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Super Admin</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="super-admin-email">Username or Email</Label>
                      <Input
                        id="super-admin-email"
                        type="text"
                        value={superAdminEmail}
                        onChange={(e) => setSuperAdminEmail(e.target.value)}
                        placeholder="admin-username or full email"
                        required
                        disabled={loadingAction}
                      />
                      <p className="text-xs text-gray-500">
                        If no @ is provided, @achievementhub.com will be added automatically
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="super-admin-password">Password</Label>
                      <Input
                        id="super-admin-password"
                        type="password"
                        value={superAdminPassword}
                        onChange={(e) => setSuperAdminPassword(e.target.value)}
                        required
                        disabled={loadingAction}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loadingAction}
                    >
                      Create Super Admin
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Super Admins have access to all departments and system settings
                    </p>
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

        <TabsContent value="admin-list">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAdmins ? (
                <p>Loading admin users...</p>
              ) : adminUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Access Level</th>
                        <th className="px-4 py-2 text-left">Departments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((admin) => (
                        <tr key={admin.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{admin.email}</td>
                          <td className="px-4 py-2">
                            {admin.is_super_admin ? (
                              <span className="inline-flex items-center text-green-600">
                                <ShieldAlert className="w-4 h-4 mr-1" />
                                Super Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-blue-600">
                                <Shield className="w-4 h-4 mr-1" />
                                Department Admin
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="max-w-md truncate">
                              {getDepartmentNames(admin.departments)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No admin users found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="message-management">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Important Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message-text">Message</Label>
                    <Input
                      id="message-text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Enter important message"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message-department">Department</Label>
                    <Select
                      value={messageForDepartment}
                      onValueChange={setMessageForDepartment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {DEPARTMENT_LIST.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loadingAction}>
                    {loadingAction ? "Adding..." : "Add Message"}
                  </Button>
                </form>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Current Messages</h3>
                  {loadingMessages ? (
                    <p>Loading messages...</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.length > 0 ? (
                        messages.map((msg) => (
                          <div key={msg.id} className="p-3 border rounded-md flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">{msg.message}</p>
                              <p className="text-xs text-gray-500">
                                Department: {msg.department || 'All Departments'}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteMessage(msg.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No messages available</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Important Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDetail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="detail-text">Detail</Label>
                    <Input
                      id="detail-text"
                      value={detailText}
                      onChange={(e) => setDetailText(e.target.value)}
                      placeholder="Enter important detail"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detail-department">Department</Label>
                    <Select
                      value={detailForDepartment}
                      onValueChange={setDetailForDepartment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {DEPARTMENT_LIST.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loadingAction}>
                    {loadingAction ? "Adding..." : "Add Detail"}
                  </Button>
                </form>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Current Details</h3>
                  <div className="space-y-3">
                    {details.length > 0 ? (
                      details.map((detail) => (
                        <div key={detail.id} className="p-3 border rounded-md flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{detail.detail}</p>
                            <p className="text-xs text-gray-500">
                              Department: {detail.department || 'All Departments'}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteDetail(detail.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No details available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
