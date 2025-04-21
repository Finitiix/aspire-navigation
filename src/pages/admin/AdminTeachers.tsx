import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Teacher = {
  id: string;
  created_at: string;
  full_name: string;
  email_id: string;
  mobile_no: string;
  designation: string;
  department: string;
  eid: string;
};

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // New search/filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [designationFilter, setDesignationFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("teacher_details").select("*");
      if (error) {
        toast.error("Error fetching teachers");
      } else {
        setTeachers(data || []);
      }
    } catch (error) {
      toast.error("Error: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        const { error } = await supabase.from("teacher_details").delete().eq("id", id);
        if (error) {
          toast.error("Error deleting teacher");
        } else {
          toast.success("Teacher deleted successfully");
          fetchTeachers();
        }
      } catch (error) {
        toast.error("Error: " + error);
      }
    }
  };

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // New handler for filtering teachers by search and designation
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.eid?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDesignation =
      !designationFilter || teacher.designation === designationFilter;
    return matchesSearch && matchesDesignation;
  });

  const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <input
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
          placeholder="Search by name, email, or EID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
          value={designationFilter || ""}
          onChange={(e) =>
            setDesignationFilter(e.target.value === "" ? null : e.target.value)
          }
        >
          <option value="">All Designations</option>
          {[...new Set(teachers.map((t) => t.designation).filter(Boolean))].map((des) => (
            <option key={des} value={des}>
              {des}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <Button onClick={() => navigate("/admin/teachers/add")}>Add Teacher</Button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {currentItems.map((teacher) => (
          <Card key={teacher.id}>
            <CardContent className="relative py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{teacher.full_name}</h3>
                  <p className="text-sm text-gray-500">EID: {teacher.eid}</p>
                  <p className="text-sm text-gray-500">Designation: {teacher.designation}</p>
                  <p className="text-sm text-gray-500">Department: {teacher.department}</p>
                  <p className="text-sm text-gray-500">Email: {teacher.email_id}</p>
                  <p className="text-sm text-gray-500">Mobile: {teacher.mobile_no}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => navigate(`/admin/teachers/edit/${teacher.id}`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(teacher.id)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: Math.ceil(filteredTeachers.length / itemsPerPage) }, (_, i) => i + 1).map(
              (page) => (
                <PaginationItem key={page} active={page === currentPage}>
                  <PaginationLink
                    href="#"
                    onClick={() => paginate(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationNext
              href="#"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredTeachers.length / itemsPerPage)}
            />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default AdminTeachers;
