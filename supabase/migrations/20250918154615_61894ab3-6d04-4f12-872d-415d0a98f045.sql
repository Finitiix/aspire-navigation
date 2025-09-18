-- Create teacher_points table to track current points
CREATE TABLE public.teacher_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  current_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create department_targets table to set targets and benefits
CREATE TABLE public.department_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id TEXT NOT NULL,
  target_points INTEGER NOT NULL,
  target_date DATE NOT NULL,
  benefits TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create points_history table to track point changes
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  points_awarded INTEGER NOT NULL,
  achievement_id UUID,
  awarded_by UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teacher_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teacher_points
CREATE POLICY "Teachers can view their own points" 
ON public.teacher_points 
FOR SELECT 
USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can view all points" 
ON public.teacher_points 
FOR SELECT 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can update points" 
ON public.teacher_points 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- RLS Policies for department_targets
CREATE POLICY "Department admins can manage their targets" 
ON public.department_targets 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM admin_departments WHERE admin_departments.admin_id = auth.uid() AND admin_departments.department_id = department_targets.department_id));

CREATE POLICY "Super admins can manage all targets" 
ON public.department_targets 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM admin_departments WHERE admin_departments.admin_id = auth.uid() AND admin_departments.is_super_admin = true));

CREATE POLICY "Teachers can view their department targets" 
ON public.department_targets 
FOR SELECT 
USING (EXISTS ( SELECT 1 FROM teacher_details WHERE teacher_details.id = auth.uid() AND teacher_details.department = department_targets.department_id));

-- RLS Policies for points_history
CREATE POLICY "Teachers can view their own points history" 
ON public.points_history 
FOR SELECT 
USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can view all points history" 
ON public.points_history 
FOR SELECT 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can insert points history" 
ON public.points_history 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_teacher_points_updated_at
BEFORE UPDATE ON public.teacher_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_department_targets_updated_at
BEFORE UPDATE ON public.department_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();