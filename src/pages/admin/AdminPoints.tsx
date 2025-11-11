import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Target, Gift } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEPARTMENTS = [
  "1st Year", "CSE 2nd Year", "CSE 3rd Year", "CSE 4th Year",
  "UIC, BCA 1st Year", "UIC, BCA 2nd Year", "UIC, BCA 3rd Year",
  "UIC, MCA 1st Year", "UIC, MCA 2nd Year",
  "AIT CSE AI/ML 2nd Year", "AIT CSE AI/ML 3rd Year", "AIT CSE AI/ML 4th Year",
  "AIT CSE NON AI/ML 2nd Year", "AIT CSE NON AI/ML 3rd Year", "AIT CSE NON AI/ML 4th Year",
  "NON-CSE 2nd Year", "NON-CSE 3rd Year", "NON-CSE 4th Year",
  "ME-NON-CSE 1st Year", "ME-NON-CSE 2nd Year",
  "ME CSE 1st Year", "ME CSE 2nd Year",
  "PhD CSE", "PhD NON-CSE"
];

interface DepartmentTarget {
  id: string;
  department_id: string;
  target_points: number;
  target_date: string;
  benefits: string[];
  created_at: string;
}

const AdminPoints = () => {
  const [adminDepartments, setAdminDepartments] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [targets, setTargets] = useState<DepartmentTarget[]>([]);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [targetPoints, setTargetPoints] = useState("");
  const [targetDate, setTargetDate] = useState<Date>();
  const [benefits, setBenefits] = useState<string[]>([""]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminAccess();
    fetchTargets();
  }, []);

  const fetchAdminAccess = async () => {
    const { data: adminData } = await supabase
      .from('admin_departments')
      .select('department_id, is_super_admin')
      .eq('admin_id', (await supabase.auth.getUser()).data.user?.id);

    if (adminData) {
      setIsSuperAdmin(adminData.some(d => d.is_super_admin));
      setAdminDepartments(adminData.map(d => d.department_id));
    }
  };

  const fetchTargets = async () => {
    const { data } = await supabase
      .from('department_targets')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setTargets(data);
    }
  };

  const availableDepartments = isSuperAdmin ? DEPARTMENTS : adminDepartments;

  const handleAddBenefit = () => {
    setBenefits([...benefits, ""]);
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const handleRemoveBenefit = (index: number) => {
    if (benefits.length > 1) {
      setBenefits(benefits.filter((_, i) => i !== index));
    }
  };

  const handleCreateTarget = async () => {
    if (!selectedDepartment || !targetPoints || !targetDate) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const filteredBenefits = benefits.filter(b => b.trim() !== "");

    try {
      const { error } = await supabase
        .from('department_targets')
        .insert({
          department_id: selectedDepartment,
          target_points: parseInt(targetPoints),
          target_date: format(targetDate, 'yyyy-MM-dd'),
          benefits: filteredBenefits
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Target created successfully"
      });

      setIsTargetDialogOpen(false);
      setSelectedDepartment("");
      setTargetPoints("");
      setTargetDate(undefined);
      setBenefits([""]);
      fetchTargets();
    } catch (error) {
      console.error('Error creating target:', error);
      toast({
        title: "Error",
        description: "Failed to create target",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Points Management</h1>
        <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Set Target
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Department Target</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  className="w-full p-2 border rounded-md"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">Target Points *</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  placeholder="Enter target points"
                  value={targetPoints}
                  onChange={(e) => setTargetPoints(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Target Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Benefits</Label>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Benefit ${index + 1}`}
                      value={benefit}
                      onChange={(e) => handleBenefitChange(index, e.target.value)}
                    />
                    {benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveBenefit(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBenefit}
                >
                  Add Benefit
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsTargetDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTarget} className="flex-1">
                Create Target
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {targets
          .filter(target => 
            isSuperAdmin || adminDepartments.includes(target.department_id)
          )
          .map((target) => (
          <Card key={target.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {target.department_id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Target Details</h4>
                  <p><strong>Points:</strong> {target.target_points}</p>
                  <p><strong>Date:</strong> {format(new Date(target.target_date), 'PPP')}</p>
                  <p><strong>Status:</strong> 
                    <span className={cn(
                      "ml-2 px-2 py-1 rounded-full text-xs",
                      new Date(target.target_date) > new Date() 
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}>
                      {new Date(target.target_date) > new Date() ? "Active" : "Expired"}
                    </span>
                  </p>
                </div>
                
                {target.benefits && target.benefits.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Benefits
                    </h4>
                    <ul className="space-y-1">
                      {target.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm">• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {targets.filter(target => 
          isSuperAdmin || adminDepartments.includes(target.department_id)
        ).length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No targets set yet. Create your first target!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* From Finitix Branding */}
      <div className="text-center py-6 mt-8">
        <p className="text-sm text-gray-500">
          From{" "}
          <a 
            href="https://www.finitix.site/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Finitix
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminPoints;