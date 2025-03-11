"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComingSoonDialog({ isOpen, onClose }: ComingSoonDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-gray-600">
          This feature is currently under development and will be available
          soon.
        </p>
      </div>
    </div>
  );
}
