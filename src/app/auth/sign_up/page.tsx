"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import FloatingOrbs from "@/components/floating-orbs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { SignUpFormData } from "@/lib/validations/auth";
import { ProfileForm } from "@/components/profile-form";
import { toast } from "sonner";
import { authApi } from "@/lib/api/endpoints/auth";
import { setTokens } from "@/lib/api/token";
import { ApiError } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loader from "@/components/loader";
import useAuthEmailStore from "@/store/useAuthEmailStore";

const Signup = () => {
  const router = useRouter();
  const { email, clearEmail } = useAuthEmailStore();
  const [isLoading, setIsLoading] = useState(false);
  const { isUserLoading, refreshUser } = useAuthGuard();

  const handleSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.signUp({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      });
      setTokens(response.data);
      clearEmail();
      await refreshUser();
      router.replace("/rooms");
    } catch (error: unknown) {
      toast.error((error as ApiError).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUserLoading && !email) {
    router.replace("/auth");
  }

  if (isUserLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
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
              Complete Your Profile
            </CardTitle>
            <CardDescription className="mt-2">
              Tell us a bit about yourself
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ProfileForm
              initialData={{ email }}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel="Create Account"
              isEmailDisabled={true}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
