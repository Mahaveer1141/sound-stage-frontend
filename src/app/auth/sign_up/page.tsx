"use client";

import { useState, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, useSearchParams } from "next/navigation";
import FloatingOrbs from "@/components/floating-orbs";
import { useForm } from "react-hook-form";
import { SignUpFormData, signUpSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { userApi } from "@/lib/api/endpoints/user";
import { setTokens } from "@/lib/api/token";
import { ApiError } from "@/lib/api";

const Signup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema as any),
    defaultValues: {
      email: email,
      firstName: "",
      lastName: "",
      profilePicture: ""
    }
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const response = await userApi.signUp({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      });
      setTokens(response.data);
      router.push("/rooms");
    } catch (error: unknown) {
      toast.error((error as ApiError).message);
    } finally {
      setIsLoading(false);
    }
  };

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
            <Form {...signUpForm}>
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={signUpForm.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={signUpForm.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <div className="flex justify-center">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-2 border-primary/50">
                          <AvatarImage src={profilePhoto || undefined} />
                          <AvatarFallback className="bg-surface text-muted-foreground">
                            <User className="w-10 h-10" />
                          </AvatarFallback>
                        </Avatar>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                        >
                          <Camera className="w-4 h-4 text-primary-foreground" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <Input
                        type="email"
                        {...field}
                        disabled
                        className="h-12 bg-surface/30 border-border/50 text-muted-foreground"
                      />
                    </div>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        First Name
                      </label>
                      <Input
                        {...field}
                        placeholder="Enter your first name"
                        required
                        className="h-12 bg-surface/50 border-border/50 focus:border-primary"
                      />
                    </div>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Last Name
                      </label>
                      <Input
                        {...field}
                        placeholder="Enter your last name"
                        className="h-12 bg-surface/50 border-border/50 focus:border-primary"
                      />
                    </div>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12"
                  variant="glow"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : "Create Account"}
                </Button>
              </motion.form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default function SignupPage() {
  return (
    <Suspense>
      <Signup />
    </Suspense>
  );
}
