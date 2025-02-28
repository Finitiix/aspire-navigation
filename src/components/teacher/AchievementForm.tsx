import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AchievementType = 
  | "Research & Publications"
  | "Book Published"
  | "Patents & Grants"
  | "Certifications & Courses"
  | "Awards & Recognitions"
  | "Projects & Workshops"
  | "Others";

const achievementTypes: AchievementType[] = [
  'Research & Publications',
  'Book Published',
  'Patents & Grants',
  'Certifications & Courses',
  'Awards & Recognitions',
  'Projects & Workshops',
  'Others'
];

type FormData = {
  achievement_type: AchievementType | '';
  title: string;
  issuing_organization: string;
  related_field: string;
  link_url: string;
  quantity: string;
  collaboration: string;
  remarks: string;
};

export const AchievementForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [date, setDate] = useState<Date>();

  const [formData, setFormData] = useState<FormData>({
    achievement_type: '',
    title: '',
    issuing_organization: '',
    related_field: '',
    link_url: '',
    quantity: '',
    collaboration: '',
    remarks: '',
  });

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('teacher_details')
          .select('*')
          .eq('id', user.id)
          .single();
        setTeacherDetails(data);
      }
    };

    fetchTeacherDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !teacherDetails || !formData.achievement_type) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('achievements')
        .insert({
          teacher_id: teacherDetails.id,
          achievement_type: formData.achievement_type,
          title: formData.title,
          date_achieved: format(date, 'yyyy-MM-dd'),
          issuing_organization: formData.issuing_organization,
          related_field: formData.related_field || null,
          link_url: formData.link_url || null,
          quantity: formData.quantity ? parseInt(formData.quantity) : null,
          collaboration: formData.collaboration || null,
          remarks: formData.remarks || null
        });

      if (error) throw error;

      toast.success("Achievement submitted successfully!");
      
      // Reset form
      setFormData({
        achievement_type: '',
        title: '',
        issuing_organization: '',
        related_field: '',
        link_url: '',
        quantity: '',
        collaboration: '',
        remarks: '',
      });
      setDate(undefined);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit achievement");
    } finally {
      setLoading(false);
    }
  };

  const showQuantityField = ['Research & Publications', 'Book Published', 'Patents & Grants'].includes(formData.achievement_type);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Achievement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">EID</label>
            <Input value={teacherDetails?.eid || ''} disabled />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input value={teacherDetails?.full_name || ''} disabled />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Input value={teacherDetails?.department || ''} disabled />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Achievement Type *</label>
            <Select
              required
              value={formData.achievement_type}
              onValueChange={(value: AchievementType) => setFormData(prev => ({ ...prev, achievement_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select achievement type" />
              </SelectTrigger>
              <SelectContent>
                {achievementTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showQuantityField && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Papers/Patents/Books *</label>
              <Input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Achievement *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Issuing Organization *</label>
            <Input
              required
              value={formData.issuing_organization}
              onChange={(e) => setFormData(prev => ({ ...prev, issuing_organization: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Related Field</label>
            <Input
              value={formData.related_field}
              onChange={(e) => setFormData(prev => ({ ...prev, related_field: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Link *</label>
            <Input
              required
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
              placeholder="https://"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Collaboration</label>
            <Input
              value={formData.collaboration}
              onChange={(e) => setFormData(prev => ({ ...prev, collaboration: e.target.value }))}
              placeholder="Names of co-authors, research partners, etc."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks</label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Optional comments or notes"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Achievement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
