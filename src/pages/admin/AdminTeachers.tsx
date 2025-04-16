import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserPlus, FileDown, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client";
import { useOutletContext } from 'react-router-dom';

// Define TypeScript interfaces for admin departments
interface AdminOutletContextType {
  departments: string[];
  isSuperAdmin: boolean;
}

// Add this helper function at the top of the file, after the imports
const safeReplace = (str: string, search: string | RegExp, replacement: string): string => {
  if (!str) return '';
  return str.replace(search, replacement);
};

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [eid, setEid] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast()
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const { departments, isSuperAdmin } = useOutletContext<AdminOutletContextType>();

  useEffect(() => {
    fetchTeachers();
    setDepartmentsList(departments);
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('teacher_details')
        .select('*');

      if (!isSuperAdmin && departments.length > 0) {
        query = query.in('department', departments);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching teachers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch teachers.",
          variant: "destructive",
        })
      } else {
        const formattedTeachers = data.map(formatTeacherData);
        setTeachers(formattedTeachers);
      }
    } catch (error) {
      console.error("Unexpected error fetching teachers:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching teachers.",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  const formatTeacherData = (data: any) => {
    return {
      id: data.id,
      full_name: data.full_name,
      designation: data.designation,
      department: safeReplace(data.department || '', '-', ' '),
      eid: data.eid,
      mobile_number: data.mobile_number,
      email_id: data.email_id,
      gender: data.gender,
      date_of_joining: data.date_of_joining,
      highest_qualification: data.highest_qualification,
      skills: data.skills ? data.skills.join(", ") : "",
      address: data.address,
      cabin_no: data.cabin_no,
      profile_pic_url: data.profile_pic_url,
      block: data.block,
      timetable_url: data.timetable_url,
    };
  };

  const filteredTeachers = teachers.filter(teacher => {
    const searchTerm = search.toLowerCase();
    return (
      teacher.full_name.toLowerCase().includes(searchTerm) ||
      teacher.designation.toLowerCase().includes(searchTerm) ||
      teacher.department.toLowerCase().includes(searchTerm) ||
      teacher.eid.toLowerCase().includes(searchTerm)
    );
  });

  const addNewTeacher = async () => {
    setIsAdding(true);
    try {
      const { data: { user } } = await supabase.auth.signUp({
        email: eid + "@pdpu.ac.in",
        password: eid,
        options: {
          data: {
            role: 'teacher',
            full_name: fullName,
          }
        }
      })

      if (user?.id) {
        const { error } = await supabase
          .from('teacher_details')
          .insert({
            id: user.id,
            full_name: fullName,
            designation: designation,
            department: department,
            eid: eid,
            email_id: eid + "@pdpu.ac.in",
          })

        if (error) {
          console.error("Error adding teacher details:", error);
          toast({
            title: "Error",
            description: "Failed to add teacher details.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Teacher added successfully.",
          })
          fetchTeachers();
          setOpen(false);
          setFullName("");
          setDesignation("");
          setDepartment("");
          setEid("");
        }
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast({
        title: "Error",
        description: "Failed to add teacher.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false);
    }
  }

  const downloadCSV = () => {
    const csvRows = [];
    const headers = Object.keys(teachers[0]);
    csvRows.push(headers.join(','));

    for (const row of teachers) {
      const values = headers.map(header => {
        const escaped = safeReplace(String(row[header]), ',', '');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'teacher_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={loading} onClick={fetchTeachers}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          {isSuperAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Teacher</DialogTitle>
                  <DialogDescription>
                    Create a new teacher account and details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="eid" className="text-right">
                      EID
                    </Label>
                    <Input
                      id="eid"
                      value={eid}
                      onChange={(e) => setEid(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="designation" className="text-right">
                      Designation
                    </Label>
                    <Input
                      id="designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">
                      Department
                    </Label>
                    <Select onValueChange={setDepartment}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentsList.map((department) => (
                          <SelectItem key={department} value={department}>{department}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" onClick={addNewTeacher} disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Add Teacher"
                  )}
                </Button>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="secondary" onClick={downloadCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>EID</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.map(teacher => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.full_name}</TableCell>
                <TableCell>{teacher.eid}</TableCell>
                <TableCell>{teacher.designation}</TableCell>
                <TableCell>{teacher.department}</TableCell>
                <TableCell>{teacher.email_id}</TableCell>
                <TableCell>{teacher.mobile_number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminTeachers;
