import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PointsApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  achievementId: string;
  teacherId: string;
  teacherName: string;
  onApprovalComplete: () => void;
}

export const PointsApprovalDialog = ({
  isOpen,
  onClose,
  achievementId,
  teacherId,
  teacherName,
  onApprovalComplete
}: PointsApprovalDialogProps) => {
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!points.trim()) {
      toast({
        title: "Error",
        description: "Please enter points to award",
        variant: "destructive"
      });
      return;
    }

    const pointsValue = parseInt(points);
    if (isNaN(pointsValue) || pointsValue < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update achievement status to approved
      const { error: achievementError } = await supabase
        .from('detailed_achievements')
        .update({ status: 'Approved' })
        .eq('id', achievementId);

      if (achievementError) throw achievementError;

      // Check if teacher already has points record
      const { data: existingPoints } = await supabase
        .from('teacher_points')
        .select('*')
        .eq('teacher_id', teacherId)
        .single();

      if (existingPoints) {
        // Update existing points
        const { error: updateError } = await supabase
          .from('teacher_points')
          .update({ 
            current_points: existingPoints.current_points + pointsValue,
            updated_at: new Date().toISOString()
          })
          .eq('teacher_id', teacherId);

        if (updateError) throw updateError;
      } else {
        // Create new points record
        const { error: insertError } = await supabase
          .from('teacher_points')
          .insert({
            teacher_id: teacherId,
            current_points: pointsValue
          });

        if (insertError) throw insertError;
      }

      // Add to points history
      const { error: historyError } = await supabase
        .from('points_history')
        .insert({
          teacher_id: teacherId,
          points_awarded: pointsValue,
          achievement_id: achievementId,
          awarded_by: (await supabase.auth.getUser()).data.user?.id,
          reason: reason || `Achievement approved: ${achievementId}`
        });

      if (historyError) throw historyError;

      toast({
        title: "Success",
        description: `Achievement approved and ${pointsValue} points awarded to ${teacherName}`
      });

      onApprovalComplete();
      onClose();
      setPoints("");
      setReason("");
    } catch (error) {
      console.error('Error approving achievement:', error);
      toast({
        title: "Error",
        description: "Failed to approve achievement and award points",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Achievement & Award Points</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Teacher: {teacherName}</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="points">Points to Award *</Label>
            <Input
              id="points"
              type="number"
              min="0"
              placeholder="Enter points (e.g., 10)"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              placeholder="Reason for awarding points"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={isLoading}>
            {isLoading ? "Approving..." : "Approve & Award Points"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};