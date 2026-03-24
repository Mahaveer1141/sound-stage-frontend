import { z } from "zod";

export const emailSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required")
});

export type EmailFormData = z.infer<typeof emailSchema>;

export const otpSchema = z.object({
  otp: z.string().nonempty("OTP is required").length(6, "OTP must be 6 digits")
});

export type OtpFormData = z.infer<typeof otpSchema>;
