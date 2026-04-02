"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm, useWatch, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import FloatingOrbs from "@/components/floating-orbs";
import {
  emailSchema,
  OtpFormData,
  otpSchema,
  type EmailFormData
} from "@/lib/validations/auth";
import { authApi } from "@/lib/api/endpoints/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loader from "@/components/loader";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { setTokens } from "@/lib/api/token";

type AuthStep = "email" | "otp";

const EmailForm = ({
  emailForm,
  handleSubmit,
  isLoading
}: {
  emailForm: UseFormReturn<EmailFormData>;
  handleSubmit: (data: EmailFormData) => void;
  isLoading: boolean;
}) => {
  return (
    <Form {...emailForm}>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={emailForm.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12 bg-surface/50 border-border/50 focus:border-primary"
                    {...field}
                  />
                </div>
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
          {isLoading ? <Spinner /> : "Send OTP"}
        </Button>
      </motion.form>
    </Form>
  );
};

const OtpForm = ({
  otpForm,
  handleSubmit,
  handleResendOtp,
  isLoading,
  isResendLoading
}: {
  otpForm: UseFormReturn<OtpFormData>;
  handleSubmit: (data: OtpFormData) => void;
  handleResendOtp: () => void;
  isLoading: boolean;
  isResendLoading: boolean;
}) => {
  const otpValue = useWatch({ control: otpForm.control, name: "otp" });

  return (
    <Form {...otpForm}>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={otpForm.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <FormField
          control={otpForm.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex justify-center">
                  <InputOTP
                    {...field}
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-12 h-14 text-lg bg-surface/50 border-border/50 rounded-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12"
          variant="glow"
          disabled={isLoading || otpValue.length !== 6}
        >
          {isLoading ? <Spinner /> : "Verify & Continue"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {isResendLoading ? (
            "Sending OTP..."
          ) : (
            <>
              {"Didn't receive the code? "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  handleResendOtp();
                }}
              >
                Resend
              </button>
            </>
          )}
        </p>
      </motion.form>
    </Form>
  );
};

const Auth = () => {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);

  const { isUserLoading } = useAuthGuard();
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema as any),
    defaultValues: {
      email: ""
    }
  });
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema as any),
    defaultValues: {
      otp: ""
    }
  });

  const handleRequestOtp = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      await authApi.requestOtp(data.email);
      setStep("otp");
    } catch (error: unknown) {
      toast.error((error as ApiError).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendLoading(true);
    try {
      await authApi.requestOtp(emailForm.getValues("email"));
      toast.success("OTP sent successfully");
    } catch (error: unknown) {
      toast.error((error as ApiError).message);
    } finally {
      setIsResendLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp(
        emailForm.getValues("email"),
        data.otp
      );
      const isNewUser = !response.data.accessToken;
      const email = emailForm.getValues("email");
      if (isNewUser) {
        router.push(`/auth/sign_up?email=${encodeURIComponent(email)}`);
      } else {
        setTokens(response.data);
        router.push("/rooms");
      }
    } catch (error: unknown) {
      toast.error((error as ApiError).message);
    } finally {
      setIsLoading(false);
    }
  };

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
            {step === "otp" && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-4"
                onClick={() => setStep("email")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step === "otp" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-2xl font-bold gradient-text">
                {step === "email" ? "Welcome Back" : "Verify OTP"}
              </CardTitle>
              <CardDescription className="mt-2">
                {step === "email"
                  ? "Enter your email to continue"
                  : `We sent a code to ${emailForm.getValues("email")}`}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            {step === "email" ? (
              <EmailForm
                emailForm={emailForm}
                handleSubmit={handleRequestOtp}
                isLoading={isLoading}
              />
            ) : (
              <OtpForm
                otpForm={otpForm}
                handleSubmit={handleVerifyOtp}
                isLoading={isLoading}
                handleResendOtp={handleResendOtp}
                isResendLoading={isResendLoading}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
