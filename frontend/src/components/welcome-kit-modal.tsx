"use client";

import React, { useState } from "react";
import { Device } from "@/app/devices/schema";
import { User } from "@/app/users/schema";
import { WelcomeKit } from "./welcome-kit";
import { fetchUserById } from "@/actions/users";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface WelcomeKitModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeKitModal({ device, isOpen, onClose }: WelcomeKitModalProps) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadUserData = async () => {
    if (!device?.userId || device.userId === 'unassigned' || device.userId === 'null') {
      setUser(undefined);
      return;
    }

    setLoading(true);
    try {
      const foundUser = await fetchUserById(device.userId);
      setUser(foundUser as User | undefined);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user information",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load user data when device or modal state changes
  React.useEffect(() => {
    if (device && isOpen) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device?.id, isOpen]);

  if (!device) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Welcome Kit - {device.deviceName}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading user information...</span>
          </div>
        ) : (
          <WelcomeKit 
            device={device} 
            user={user} 
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
