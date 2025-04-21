
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RejectReasonModalProps {
  open: boolean;
  teacherEmail: string;
  title: string;
  loading: boolean;
  reason: string;
  onReasonChange: (v: string) => void;
  onClose: () => void;
  onSend: () => void;
}

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  open,
  teacherEmail,
  title,
  loading,
  reason,
  onReasonChange,
  onClose,
  onSend,
}) => {
  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Document: {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="block font-medium mb-1">To</label>
            <Input type="email" value={teacherEmail} disabled />
          </div>
          <div>
            <label className="block font-medium mb-1">Reason for Rejection</label>
            <Input
              type="text"
              value={reason}
              onChange={e => onReasonChange(e.target.value)}
              placeholder="Reason"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onSend} loading={loading}>
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RejectReasonModal;
