import React, { useState, useRef } from "react";
import { Camera, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpFormData } from "@/lib/validations/auth";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface ProfileFormProps {
  initialData?: Partial<SignUpFormData>;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
  isEmailDisabled?: boolean;
}

export function ProfileForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Save",
  isEmailDisabled = true
}: ProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    initialData?.profilePicture || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema as any),
    defaultValues: {
      email: initialData?.email || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      profilePicture: initialData?.profilePicture || ""
    }
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be smaller than 10 MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setSelectedFile(file);
    setIsRemoved(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string);
      form.setValue("profilePicture", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelectedFile(null);
    setIsRemoved(true);
    setProfilePhoto(null);
    form.setValue("profilePicture", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = async (values: SignUpFormData) => {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("firstName", values.firstName);
    if (values.lastName) {
      formData.append("lastName", values.lastName);
    }
    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    } else if (isRemoved) {
      formData.append("removeProfilePicture", "true");
    }
    await onSubmit(formData);
  };

  return (
    <Form {...form}>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="profilePicture"
          render={() => (
            <div className="flex justify-center">
              <div
                className="relative cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-24 h-24 border-2 border-primary/50">
                  <AvatarImage src={profilePhoto || undefined} />
                  <AvatarFallback className="bg-surface text-muted-foreground">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </div>
                {profilePhoto && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => handleRemovePhoto(e)}
                        className="absolute top-0 right-0 w-6 h-6 bg-destructive rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                      >
                        <X className="w-3 h-3 text-destructive-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Remove photo</TooltipContent>
                  </Tooltip>
                )}
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
