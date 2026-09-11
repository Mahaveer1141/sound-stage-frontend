import { z } from "zod";

export const emailSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .trim()
    .min(1, "Email is required")
});

export type EmailFormData = z.infer<typeof emailSchema>;

export const otpSchema = z.object({
  otp: z.string().nonempty("OTP is required").length(6, "OTP must be 6 digits")
});

export type OtpFormData = z.infer<typeof otpSchema>;

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim(),
  email: z
    .email("Please enter a valid email address")
    .trim()
    .min(1, "Email is required"),
  profilePicture: z.string().optional()
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
