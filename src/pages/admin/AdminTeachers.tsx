import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Edit, Trash2, FileDown, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DatePicker } from "@/components/ui/date-picker"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DepartmentSelect } from "@/components/ui/department-select";

// Define a schema for the form.
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  eid: z.string().regex(/^E\d{5}$/, {
    message: "Teacher ID must be in format EXXXXX (E followed by 5 digits)",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  department: z.string().min(2, {
    message: "Department must be at least 2 characters.",
  }),
  designation: z.string().min(2, {
    message: "Designation must be at least 2 characters.",
  }),
  joining_date: z.date({
    required_error: "A date of joining is required.",
  }),
  phone_number: z.string().regex(/^(\+?\d{1,4}?)?\d{6,14}$/, {
    message: "Please enter a valid phone number.",
  }),
  profile_picture: z.string().url({
    message: "Please enter a valid URL for the profile picture.",
  }).optional(),
  certificates: z.array(z.object({
    name: z.string().min(2, {
      message: "Certificate name must be at least 2 characters.",
    }),
    url: z.string().url({
      message: "Please enter a valid URL for the certificate.",
    }),
  })).optional(),
})

interface Teacher {
  id: string;
  created_at: string;
  name: string;
  eid: string;
  email: string;
  department: string;
  designation: string;
  joining_date: string;
  phone_number: string;
  profile_picture: string | null;
  certificates: { name: string; url: string; }[] | null;
}

interface Certificate {
  id: string;
  teacher_id: string;
  name: string;
  url: string;
}

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isCreateTeacherDialogOpen, setIsCreateTeacherDialogOpen] = useState(false);
  const [isEditTeacherDialogOpen, setIsEditTeacherDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDeleteTeacherDialogOpen, setIsDeleteTeacherDialogOpen] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [isAddingToDepartments, setIsAddingToDepartments] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'xlsx' | 'csv'>('xlsx');
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkAddToDepartmentDialogOpen, setIsBulkAddToDepartmentDialogOpen] = useState(false);
  const [isBulkAddingToDepartment, setIsBulkAddingToDepartment] = useState(false);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEditDepartment, setBulkEditDepartment] = useState<string>("");
  const [isBulkEditDepartmentDialogOpen, setIsBulkEditDepartmentDialogOpen] = useState(false);
  const [isBulkEditDepartmentLoading, setIsBulkEditDepartmentLoading] = useState(false);
  const [isBulkEditDesignationDialogOpen, setIsBulkEditDesignationDialogOpen] = useState(false);
  const [isBulkEditDesignationLoading, setIsBulkEditDesignationLoading] = useState(false);
  const [bulkEditDesignation, setBulkEditDesignation] = useState<string>("");
  const [isBulkEditDesignationOpen, setIsBulkEditDesignationOpen] = useState(false);
  const [isBulkEditJoiningDateDialogOpen, setIsBulkEditJoiningDateDialogOpen] = useState(false);
  const [isBulkEditJoiningDateLoading, setIsBulkEditJoiningDateLoading] = useState(false);
  const [bulkEditJoiningDate, setBulkEditJoiningDate] = useState<Date | undefined>(undefined);
  const [isBulkEditJoiningDateOpen, setIsBulkEditJoiningDateOpen] = useState(false);
  const [isBulkEditProfilePictureDialogOpen, setIsBulkEditProfilePictureDialogOpen] = useState(false);
  const [isBulkEditProfilePictureLoading, setIsBulkEditProfilePictureLoading] = useState(false);
  const [bulkEditProfilePicture, setBulkEditProfilePicture] = useState<string>("");
  const [isBulkEditProfilePictureOpen, setIsBulkEditProfilePictureOpen] = useState(false);
  const [isBulkEditCertificatesDialogOpen, setIsBulkEditCertificatesDialogOpen] = useState(false);
  const [isBulkEditCertificatesLoading, setIsBulkEditCertificatesLoading] = useState(false);
  const [bulkEditCertificates, setBulkEditCertificates] = useState<any[]>([]);
  const [isBulkEditCertificatesOpen, setIsBulkEditCertificatesOpen] = useState(false);
  const [isBulkEditNameDialogOpen, setIsBulkEditNameDialogOpen] = useState(false);
  const [isBulkEditNameLoading, setIsBulkEditNameLoading] = useState(false);
  const [bulkEditName, setBulkEditName] = useState<string>("");
  const [isBulkEditNameOpen, setIsBulkEditNameOpen] = useState(false);
  const [isBulkEditEidDialogOpen, setIsBulkEditEidDialogOpen] = useState(false);
  const [isBulkEditEidLoading, setIsBulkEditEidLoading] = useState(false);
  const [bulkEditEid, setBulkEditEid] = useState<string>("");
  const [isBulkEditEidOpen, setIsBulkEditEidOpen] = useState(false);
  const [isBulkEditEmailDialogOpen, setIsBulkEditEmailDialogOpen] = useState(false);
  const [isBulkEditEmailLoading, setIsBulkEditEmailLoading] = useState(false);
  const [bulkEditEmail, setBulkEditEmail] = useState<string>("");
  const [isBulkEditEmailOpen, setIsBulkEditEmailOpen] = useState(false);
  const [isBulkEditPhoneNumberDialogOpen, setIsBulkEditPhoneNumberDialogOpen] = useState(false);
  const [isBulkEditPhoneNumberLoading, setIsBulkEditPhoneNumberLoading] = useState(false);
  const [bulkEditPhoneNumber, setBulkEditPhoneNumber] = useState<string>("");
  const [isBulkEditPhoneNumberOpen, setIsBulkEditPhoneNumberOpen] = useState(false);
  const [isBulkEditCertificatesAddDialogOpen, setIsBulkEditCertificatesAddDialogOpen] = useState(false);
  const [isBulkEditCertificatesAddLoading, setIsBulkEditCertificatesAddLoading] = useState(false);
  const [bulkEditCertificatesAdd, setBulkEditCertificatesAdd] = useState<any[]>([]);
  const [isBulkEditCertificatesAddOpen, setIsBulkEditCertificatesAddOpen] = useState(false);
  const [isBulkEditCertificatesRemoveDialogOpen, setIsBulkEditCertificatesRemoveDialogOpen] = useState(false);
  const [isBulkEditCertificatesRemoveLoading, setIsBulkEditCertificatesRemoveLoading] = useState(false);
  const [bulkEditCertificatesRemove, setBulkEditCertificatesRemove] = useState<any[]>([]);
  const [isBulkEditCertificatesRemoveOpen, setIsBulkEditCertificatesRemoveOpen] = useState(false);
  const [isBulkEditCertificatesEditDialogOpen, setIsBulkEditCertificatesEditDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditLoading, setIsBulkEditCertificatesEditLoading] = useState(false);
  const [bulkEditCertificatesEdit, setBulkEditCertificatesEdit] = useState<any[]>([]);
  const [isBulkEditCertificatesEditOpen, setIsBulkEditCertificatesEditOpen] = useState(false);
  const [isBulkEditCertificatesEditNameDialogOpen, setIsBulkEditCertificatesEditNameDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditNameLoading, setIsBulkEditCertificatesEditNameLoading] = useState(false);
  const [bulkEditCertificatesEditName, setBulkEditCertificatesEditName] = useState<string>("");
  const [isBulkEditCertificatesEditNameOpen, setIsBulkEditCertificatesEditNameOpen] = useState(false);
  const [isBulkEditCertificatesEditUrlDialogOpen, setIsBulkEditCertificatesEditUrlDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditUrlLoading, setIsBulkEditCertificatesEditUrlLoading] = useState(false);
  const [bulkEditCertificatesEditUrl, setBulkEditCertificatesEditUrl] = useState<string>("");
  const [isBulkEditCertificatesEditUrlOpen, setIsBulkEditCertificatesEditUrlOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllDialogOpen, setIsBulkEditCertificatesRemoveAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllLoading, setIsBulkEditCertificatesRemoveAllLoading] = useState(false);
  const [bulkEditCertificatesRemoveAll, setBulkEditCertificatesRemoveAll] = useState<any[]>([]);
  const [isBulkEditCertificatesRemoveAllOpen, setIsBulkEditCertificatesRemoveAllOpen] = useState(false);
  const [isBulkEditCertificatesAddAllDialogOpen, setIsBulkEditCertificatesAddAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesAddAllLoading, setIsBulkEditCertificatesAddAllLoading] = useState(false);
  const [bulkEditCertificatesAddAll, setBulkEditCertificatesAddAll] = useState<any[]>([]);
  const [isBulkEditCertificatesAddAllOpen, setIsBulkEditCertificatesAddAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllDialogOpen, setIsBulkEditCertificatesEditAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllLoading, setIsBulkEditCertificatesEditAllLoading] = useState(false);
  const [bulkEditCertificatesEditAll, setBulkEditCertificatesEditAll] = useState<any[]>([]);
  const [isBulkEditCertificatesEditAllOpen, setIsBulkEditCertificatesEditAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllNameDialogOpen, setIsBulkEditCertificatesEditAllNameDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllNameLoading, setIsBulkEditCertificatesEditAllNameLoading] = useState(false);
  const [bulkEditCertificatesEditAllName, setBulkEditCertificatesEditAllName] = useState<string>("");
  const [isBulkEditCertificatesEditAllNameOpen, setIsBulkEditCertificatesEditAllNameOpen] = useState(false);
  const [isBulkEditCertificatesEditAllUrlDialogOpen, setIsBulkEditCertificatesEditAllUrlDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllUrlLoading, setIsBulkEditCertificatesEditAllUrlLoading] = useState(false);
  const [bulkEditCertificatesEditAllUrl, setBulkEditCertificatesEditAllUrl] = useState<string>("");
  const [isBulkEditCertificatesEditAllUrlOpen, setIsBulkEditCertificatesEditAllUrlOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllDialogOpen, setIsBulkEditCertificatesRemoveAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllLoading, setIsBulkEditCertificatesRemoveAllAllLoading] = useState(false);
  const [bulkEditCertificatesRemoveAllAll, setBulkEditCertificatesRemoveAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesRemoveAllAllOpen, setIsBulkEditCertificatesRemoveAllAllOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllDialogOpen, setIsBulkEditCertificatesAddAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllLoading, setIsBulkEditCertificatesAddAllAllLoading] = useState(false);
  const [bulkEditCertificatesAddAllAll, setBulkEditCertificatesAddAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesAddAllAllOpen, setIsBulkEditCertificatesAddAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllDialogOpen, setIsBulkEditCertificatesEditAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllLoading, setIsBulkEditCertificatesEditAllAllLoading] = useState(false);
  const [bulkEditCertificatesEditAllAll, setBulkEditCertificatesEditAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesEditAllAllOpen, setIsBulkEditCertificatesEditAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllNameDialogOpen, setIsBulkEditCertificatesEditAllAllNameDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllNameLoading, setIsBulkEditCertificatesEditAllAllNameLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllName, setBulkEditCertificatesEditAllAllName] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllNameOpen, setIsBulkEditCertificatesEditAllAllNameOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllUrlDialogOpen, setIsBulkEditCertificatesEditAllAllUrlDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllUrlLoading, setIsBulkEditCertificatesEditAllAllUrlLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllUrl, setBulkEditCertificatesEditAllAllUrl] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllUrlOpen, setIsBulkEditCertificatesEditAllAllUrlOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllDialogOpen, setIsBulkEditCertificatesRemoveAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllLoading, setIsBulkEditCertificatesRemoveAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesRemoveAllAllAll, setBulkEditCertificatesRemoveAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesRemoveAllAllAllOpen, setIsBulkEditCertificatesRemoveAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllDialogOpen, setIsBulkEditCertificatesAddAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllLoading, setIsBulkEditCertificatesAddAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesAddAllAllAll, setBulkEditCertificatesAddAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesAddAllAllAllOpen, setIsBulkEditCertificatesAddAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllDialogOpen, setIsBulkEditCertificatesEditAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllLoading, setIsBulkEditCertificatesEditAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAll, setBulkEditCertificatesEditAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesEditAllAllAllOpen, setIsBulkEditCertificatesEditAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllNameDialogOpen, setIsBulkEditCertificatesEditAllAllAllNameDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllNameLoading, setIsBulkEditCertificatesEditAllAllAllNameLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllName, setBulkEditCertificatesEditAllAllAllName] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllNameOpen, setIsBulkEditCertificatesEditAllAllAllNameOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllUrlDialogOpen, setIsBulkEditCertificatesEditAllAllAllUrlDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllUrlLoading, setIsBulkEditCertificatesEditAllAllAllUrlLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllUrl, setBulkEditCertificatesEditAllAllAllUrl] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllUrlOpen, setIsBulkEditCertificatesEditAllAllAllUrlOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllDialogOpen, setIsBulkEditCertificatesRemoveAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllLoading, setIsBulkEditCertificatesRemoveAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesRemoveAllAllAllAll, setBulkEditCertificatesRemoveAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesRemoveAllAllAllAllOpen, setIsBulkEditCertificatesRemoveAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllDialogOpen, setIsBulkEditCertificatesAddAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllLoading, setIsBulkEditCertificatesAddAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesAddAllAllAllAll, setBulkEditCertificatesAddAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesAddAllAllAllAllOpen, setIsBulkEditCertificatesAddAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllLoading, setIsBulkEditCertificatesEditAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAll, setBulkEditCertificatesEditAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesEditAllAllAllAllOpen, setIsBulkEditCertificatesEditAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllNameDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllNameDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllNameLoading, setIsBulkEditCertificatesEditAllAllAllAllNameLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllName, setBulkEditCertificatesEditAllAllAllAllName] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllAllNameOpen, setIsBulkEditCertificatesEditAllAllAllAllNameOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllUrlDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllUrlDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllUrlLoading, setIsBulkEditCertificatesEditAllAllAllAllUrlLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllUrl, setBulkEditCertificatesEditAllAllAllAllUrl] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllAllUrlOpen, setIsBulkEditCertificatesEditAllAllAllAllUrlOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesRemoveAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllLoading, setIsBulkEditCertificatesRemoveAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesRemoveAllAllAllAllAll, setBulkEditCertificatesRemoveAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllOpen, setIsBulkEditCertificatesRemoveAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesAddAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllAllLoading, setIsBulkEditCertificatesAddAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesAddAllAllAllAllAll, setBulkEditCertificatesAddAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesAddAllAllAllAllAllOpen, setIsBulkEditCertificatesAddAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllLoading, setIsBulkEditCertificatesEditAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAll, setBulkEditCertificatesEditAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesEditAllAllAllAllAllOpen, setIsBulkEditCertificatesEditAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllNameDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllNameDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllNameLoading, setIsBulkEditCertificatesEditAllAllAllAllAllNameLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAllName, setBulkEditCertificatesEditAllAllAllAllAllName] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllAllAllNameOpen, setIsBulkEditCertificatesEditAllAllAllAllAllNameOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllUrlDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllUrlDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllUrlLoading, setIsBulkEditCertificatesEditAllAllAllAllAllUrlLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAllUrl, setBulkEditCertificatesEditAllAllAllAllAllUrl] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllAllAllUrlOpen, setIsBulkEditCertificatesEditAllAllAllAllAllUrlOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesRemoveAllAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllAllLoading, setIsBulkEditCertificatesRemoveAllAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesRemoveAllAllAllAllAllAll, setBulkEditCertificatesRemoveAllAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllAllOpen, setIsBulkEditCertificatesRemoveAllAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesAddAllAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllAllAllLoading, setIsBulkEditCertificatesAddAllAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesAddAllAllAllAllAllAll, setBulkEditCertificatesAddAllAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesAddAllAllAllAllAllAllOpen, setIsBulkEditCertificatesAddAllAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllLoading, setIsBulkEditCertificatesEditAllAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAllAll, setBulkEditCertificatesEditAllAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllNameDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllNameDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllNameLoading, setIsBulkEditCertificatesEditAllAllAllAllAllAllNameLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAllAllName, setBulkEditCertificatesEditAllAllAllAllAllAllName] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllAllAllAllNameOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllNameOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllUrlDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllUrlDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllUrlLoading, setIsBulkEditCertificatesEditAllAllAllAllAllAllUrlLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAllAllUrl, setBulkEditCertificatesEditAllAllAllAllAllAllUrl] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllAllAllAllUrlOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllUrlOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesRemoveAllAllAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllAllAllLoading, setIsBulkEditCertificatesRemoveAllAllAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesRemoveAllAllAllAllAllAllAll, setBulkEditCertificatesRemoveAllAllAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllAllAllOpen, setIsBulkEditCertificatesRemoveAllAllAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesAddAllAllAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllAllAllAllLoading, setIsBulkEditCertificatesAddAllAllAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesAddAllAllAllAllAllAllAll, setBulkEditCertificatesAddAllAllAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesAddAllAllAllAllAllAllAllOpen, setIsBulkEditCertificatesAddAllAllAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllLoading, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAllAllAll, setBulkEditCertificatesEditAllAllAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllNameDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllNameDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllNameLoading, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllNameLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAllAllAllName, setBulkEditCertificatesEditAllAllAllAllAllAllAllName] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllNameOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllNameOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllUrlDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllUrlDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllUrlLoading, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllUrlLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAllAllAllUrl, setBulkEditCertificatesEditAllAllAllAllAllAllAllUrl] = useState<string>("");
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllUrlOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllUrlOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesRemoveAllAllAllAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllAllAllAllLoading, setIsBulkEditCertificatesRemoveAllAllAllAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesRemoveAllAllAllAllAllAllAllAll, setBulkEditCertificatesRemoveAllAllAllAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesRemoveAllAllAllAllAllAllAllAllOpen, setIsBulkEditCertificatesRemoveAllAllAllAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesAddAllAllAllAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesAddAllAllAllAllAllAllAllAllLoading, setIsBulkEditCertificatesAddAllAllAllAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesAddAllAllAllAllAllAllAllAll, setBulkEditCertificatesAddAllAllAllAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesAddAllAllAllAllAllAllAllAllOpen, setIsBulkEditCertificatesAddAllAllAllAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllAllDialogOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllAllDialogOpen] = useState(false);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllAllLoading, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllAllLoading] = useState(false);
  const [bulkEditCertificatesEditAllAllAllAllAllAllAllAll, setBulkEditCertificatesEditAllAllAllAllAllAllAllAll] = useState<any[]>([]);
  const [isBulkEditCertificatesEditAllAllAllAllAllAllAllAllOpen, setIsBulkEditCertificatesEditAllAllAllAllAllAllAllAllOpen] = useState(false);
  const [isBulkEditCertificatesEditAll
