"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FloatingOrbs from "@/components/floating-orbs";
import { Mic, ArrowRight, Sparkles } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loader from "@/components/loader";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RoomCreationFormData,
  roomCreationSchema
} from "@/lib/validations/room";
import { roomApi } from "@/lib/api/endpoints/room";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

const CreateRoom = () => {
  const router = useRouter();
  const { isUserLoading } = useAuthGuard();

  const form = useForm({
    resolver: zodResolver(roomCreationSchema as any),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const createRoom = async (data: RoomCreationFormData) => {
    try {
      await roomApi.create(data);
      toast.success("Room created successfully");
      router.push("/rooms");
    } catch (error) {
      toast.error((error as ApiError).message);
    }
  };

  if (isUserLoading) {
    return <Loader />;
  }

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4">
      <FloatingOrbs />

      <div className="container mx-auto max-w-2xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary to-secondary glow">
              <Mic className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Create a New Stage
          </h1>
          <p className="text-muted-foreground text-lg">
            Set up your live audio room and start broadcasting
          </p>
        </motion.div>

        <Form {...form}>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={form.handleSubmit(createRoom)}
            className="glass rounded-2xl p-8 space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="name" className="text-foreground">
                    Room Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Tech Talk: Future of AI"
                      className="glass border-border/50 focus:border-primary h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="name" className="text-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What will you discuss in this room?"
                      className="glass border-border/50 focus:border-primary min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Room Settings
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-muted-foreground">
                    You will be the host
                  </span>
                  <span className="text-primary font-medium">Admin</span>
                </div>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-muted-foreground">
                    Listeners can request to speak
                  </span>
                  <span className="text-primary font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-muted-foreground">Room visibility</span>
                  <span className="text-primary font-medium">Public</span>
                </div>
              </div>
            </div>

            <Button
              variant="glow"
              size="xl"
              className="w-full group"
              type="submit"
            >
              Go Live
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.form>
        </Form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground text-sm">
            💡 Tip: A descriptive room name helps attract the right audience
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRoom;
