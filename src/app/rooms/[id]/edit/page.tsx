"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mic, Save } from "lucide-react";
import FloatingOrbs from "@/components/floating-orbs";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loader from "@/components/loader";
import { RoomForm } from "@/components/room-form";
import { roomApi } from "@/lib/api/endpoints/room";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { RoomType } from "@/lib/api/types";

const EditRoom = () => {
  const router = useRouter();
  const { id } = useParams();
  const { isUserLoading } = useAuthGuard();

  const [room, setRoom] = useState<RoomType | null>(null);
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;
      setIsRoomLoading(true);

      try {
        const memberRes = await roomApi.currentRoomUser(id as string);
        if (!memberRes.data.isAdmin) {
          toast.error("Only admins can update this room");
          router.push("/rooms");
          return;
        }
      } catch {
        router.push("/rooms");
        return;
      }

      try {
        const res = await roomApi.show(id as string);
        setRoom(res.data);
      } catch {
        toast.error("Failed to load room");
        router.push("/rooms");
      } finally {
        setIsRoomLoading(false);
      }
    };
    fetchRoom();
  }, [id, router]);

  const updateRoom = async (data: FormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await roomApi.update(id as string, data);
      toast.success("Room updated successfully");
      router.push(`/rooms/${id}`);
    } catch (error) {
      toast.error((error as ApiError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || isRoomLoading) {
    return <Loader />;
  }

  if (!room) {
    return null;
  }

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4">
      <FloatingOrbs />

      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-linear-to-r from-primary to-secondary glow">
              <Mic className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Edit Stage</h1>
          <p className="text-muted-foreground text-lg">
            Update your room details, images, and settings
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8"
        >
          <RoomForm
            initialData={room}
            onSubmit={updateRoom}
            isLoading={isSubmitting}
            submitLabel={
              <span className="flex items-center justify-center gap-2">
                Save Changes <Save className="w-4 h-4" />
              </span>
            }
          />
        </motion.div>
      </div>
    </div>
  );
};

export default EditRoom;
