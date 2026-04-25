"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import FloatingOrbs from "@/components/floating-orbs";
import { SignUpFormData } from "@/lib/validations/auth";
import { ProfileForm } from "@/components/profile-form";
import { toast } from "sonner";
import { userApi } from "@/lib/api/endpoints/user";
import { ApiError } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loader from "@/components/loader";

export default function ProfilePage() {
  const { user, isUserLoading } = useAuthGuard();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await userApi.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        profilePicture: data.profilePicture
      });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      toast.error((error as ApiError).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || !user) {
    return <Loader />;
  }

  console.log(user);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden mt-16">
      <FloatingOrbs />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="glass border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold gradient-text">
              Update Profile
            </CardTitle>
            <CardDescription className="mt-2">
              Manage your personal information
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ProfileForm
              initialData={{
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture
              }}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel="Save Changes"
              isEmailDisabled={true}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
