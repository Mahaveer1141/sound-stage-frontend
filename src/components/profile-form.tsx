import React, { useState, useRef } from "react";
import { Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { SignUpFormData, signUpSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

export interface ProfileFormProps {
  initialData?: Partial<SignUpFormData>;
  onSubmit: (data: SignUpFormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
  isEmailDisabled?: boolean;
}

export function ProfileForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Save",
  isEmailDisabled = true,
}: ProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    initialData?.profilePicture || null
  );

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema as any),
    defaultValues: {
      email: initialData?.email || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      profilePicture: initialData?.profilePicture || "",
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        form.setValue("profilePicture", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
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
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-muted-foreground">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  disabled={isEmailDisabled}
                  className={`h-12 bg-surface/30 border-border/50 text-muted-foreground ${
                    isEmailDisabled ? "opacity-50" : ""
                  }`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-foreground">
                First Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your first name"
                  required
                  className="h-12 bg-surface/50 border-border/50 focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-foreground">
                Last Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your last name"
                  className="h-12 bg-surface/50 border-border/50 focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12"
          variant="glow"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : submitLabel}
        </Button>
      </motion.form>
    </Form>
  );
}
