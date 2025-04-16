
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ChevronRight, Plus, Trash2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  teacherCount?: number;
  documentCount?: number;
}

interface DepartmentMetrics {
  departmentId: string;
  departmentName: string;
  totalDocuments: number;
  approvedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  documentsByCategory: {
    [key: string]: number;
  };
}

// Helper function to create a safe replace alternative to replaceAll
function safeReplace(str: string, search: string, replacement: string) {
  return str.split(search).join(replacement);
}

const AdminDepartments = () => {
  // Get admin context information
  const { departments: adminDepartments, isSuperAdmin } = useOutletContext<{
    departments: string[];
    isSuperAdmin: boolean;
  }>();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DepartmentMetrics[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  
  // Used for chart coloring
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    // Only fetch if the user is a super admin
    if (isSuperAdmin) {
      fetchDepartments();
    }
  }, [isSuperAdmin]);
  
  useEffect(() => {
    if (departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0].id);
    }
    
    if (departments.length > 0) {
      fetchMetrics();
    }
  }, [departments]);
  
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      
      // First, get all departments that the admin has access to through the admin_departments table
      const { data: adminDeptData, error: adminDeptError } = await supabase
        .from('admin_departments')
        .select('department_id, is_super_admin');
      
      if (adminDeptError) throw adminDeptError;
      
      // Extract department IDs
      const departmentIds = adminDeptData?.map(item => item.department_id) || [];
      
      // Fetch department details
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*');
        
      if (departmentsError) throw departmentsError;
      
      // Fetch teacher counts for each department
      const departmentsWithCount = await Promise.all(
        (departmentsData || []).map(async (dept) => {
          const { count: teacherCount } = await supabase
            .from('teacher_details')
            .select('*', { count: 'exact' })
            .eq('department', dept.id);
            
          const { count: documentCount } = await supabase
            .from('detailed_achievements')
            .select('*', { count: 'exact' })
            .eq('teacher_department', dept.id);
            
          return {
            ...dept,
            teacherCount: teacherCount || 0,
            documentCount: documentCount || 0
          };
        })
      );
      
      setDepartments(departmentsWithCount);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMetrics = async () => {
    try {
      const allMetrics = await Promise.all(
        departments.map(async (dept) => {
          // Count total documents
          const { count: totalCount } = await supabase
            .from('detailed_achievements')
            .select('*', { count: 'exact' })
            .eq('teacher_department', dept.id);
            
          // Count approved documents
          const { count: approvedCount } = await supabase
            .from('detailed_achievements')
            .select('*', { count: 'exact' })
            .eq('teacher_department', dept.id)
            .eq('status', 'Approved');
            
          // Count pending documents
          const { count: pendingCount } = await supabase
            .from('detailed_achievements')
            .select('*', { count: 'exact' })
            .eq('teacher_department', dept.id)
            .eq('status', 'Pending Approval');
            
          // Count rejected documents
          const { count: rejectedCount } = await supabase
            .from('detailed_achievements')
            .select('*', { count: 'exact' })
            .eq('teacher_department', dept.id)
            .eq('status', 'Rejected');
            
          // Get category breakdown
          const { data: categoryData } = await supabase
            .from('detailed_achievements')
            .select('category')
            .eq('teacher_department', dept.id);
            
          const categoryCount: { [key: string]: number } = {};
          categoryData?.forEach(item => {
            if (item.category) {
              categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
            }
          });
          
          return {
            departmentId: dept.id,
            departmentName: dept.name,
            totalDocuments: totalCount || 0,
            approvedDocuments: approvedCount || 0,
            pendingDocuments: pendingCount || 0,
            rejectedDocuments: rejectedCount || 0,
            documentsByCategory: categoryCount
          };
        })
      );
      
      setMetrics(allMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to fetch department metrics');
    }
  };
  
  const handleAddDepartment = async () => {
    try {
      if (!newDepartmentId.trim() || !newDepartmentName.trim()) {
        toast.error('Department ID and name are required');
        return;
      }
      
      // First add to departments table
      const { error } = await supabase
        .from('departments')
        .insert({ id: newDepartmentId.trim(), name: newDepartmentName.trim() });
        
      if (error) throw error;
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Add admin's access to this department
        const { error: adminDeptError } = await supabase
          .from('admin_departments')
          .insert({ 
            admin_id: user.id, 
            department_id: newDepartmentId.trim(),
            is_super_admin: true 
          });
          
        if (adminDeptError) throw adminDeptError;
      }
      
      toast.success('Department added successfully');
      setIsAddDialogOpen(false);
      setNewDepartmentId("");
      setNewDepartmentName("");
      fetchDepartments();
    } catch (error) {
      console.error('Error adding department:', error);
      toast.error('Failed to add department');
    }
  };
  
  const handleDeleteDepartment = async () => {
    try {
      if (!departmentToDelete) return;
      
      // Check if there are any teachers in this department
      const { count } = await supabase
        .from('teacher_details')
        .select('*', { count: 'exact' })
        .eq('department', departmentToDelete.id);
        
      if (count && count > 0) {
        toast.error(`Cannot delete department with ${count} teachers. Reassign teachers first.`);
        return;
      }
      
      // First delete from admin_departments
      const { error: adminDeptError } = await supabase
        .from('admin_departments')
        .delete()
        .eq('department_id', departmentToDelete.id);
        
      if (adminDeptError) throw adminDeptError;
      
      // Then delete from departments table
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentToDelete.id);
        
      if (error) throw error;
      
      toast.success('Department deleted successfully');
      setIsDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };
  
  const getSelectedDepartmentMetrics = () => {
    if (!selectedDepartment) return null;
    return metrics.find(m => m.departmentId === selectedDepartment) || null;
  };

  const renderOverviewStats = () => {
    if (loading) return <div className="text-center py-10">Loading department metrics...</div>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{departments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {departments.reduce((total, dept) => total + (dept.teacherCount || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {departments.reduce((total, dept) => total + (dept.documentCount || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDepartmentList = () => {
    if (loading) return <div className="text-center py-10">Loading departments...</div>;
    
    if (departments.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No departments found</p>
          {isSuperAdmin && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Department
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <>
        {isSuperAdmin && (
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Department
            </Button>
          </div>
        )}
        <div className="space-y-2">
          {departments.map(dept => (
            <Card 
              key={dept.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedDepartment === dept.id ? 'border-primary border-2' : ''
              }`}
              onClick={() => setSelectedDepartment(dept.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{dept.name}</h3>
                    <p className="text-sm text-gray-500">ID: {dept.id}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm"><span className="font-medium">{dept.teacherCount}</span> Teachers</p>
                      <p className="text-sm"><span className="font-medium">{dept.documentCount}</span> Documents</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDepartmentToDelete(dept);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  };

  const renderDepartmentDetail = () => {
    const departmentMetrics = getSelectedDepartmentMetrics();
    const department = departments.find(d => d.id === selectedDepartment);
    
    if (!departmentMetrics || !department) {
      return <div className="text-center py-10">Select a department to view details</div>;
    }
    
    // Prepare data for status chart
    const statusData = [
      { name: 'Approved', value: departmentMetrics.approvedDocuments },
      { name: 'Pending', value: departmentMetrics.pendingDocuments },
      { name: 'Rejected', value: departmentMetrics.rejectedDocuments },
    ];
    
    // Prepare data for category chart
    const categoryData = Object.entries(departmentMetrics.documentsByCategory).map(
      ([category, count]) => ({
        name: category,
        count
      })
    );
    
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{department.name}</h2>
          <p className="text-gray-500">Department ID: {department.id}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{department.teacherCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{departmentMetrics.totalDocuments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {departmentMetrics.totalDocuments > 0 
                  ? Math.round((departmentMetrics.approvedDocuments / departmentMetrics.totalDocuments) * 100) 
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Document Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Document Status</CardTitle>
              <CardDescription>Breakdown by approval status</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Category Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Documents by category</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Redirect if not a super admin
  if (!isSuperAdmin) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Only super administrators can access the department management section.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Department Management</h1>
      </div>

      {/* Department Overview Statistics */}
      {renderOverviewStats()}

      {/* Department List and Detail Views */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Department List</TabsTrigger>
          <TabsTrigger value="detail" disabled={!selectedDepartment}>Department Detail</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0">
          {renderDepartmentList()}
        </TabsContent>
        
        <TabsContent value="detail" className="mt-0">
          {renderDepartmentDetail()}
        </TabsContent>
      </Tabs>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Enter the details for the new department.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department-id">Department ID</Label>
              <Input
                id="department-id"
                placeholder="E.g., CSE, ECE, MECH"
                value={newDepartmentId}
                onChange={(e) => setNewDepartmentId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department-name">Department Name</Label>
              <Input
                id="department-name"
                placeholder="E.g., Computer Science Engineering"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDepartment}>Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the department "{departmentToDelete?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDepartment}>Delete Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDepartments;
