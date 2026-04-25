import z from "zod";

export const roomCreationSchema = z.object({
  name: z.string().min(1, "Room name is required").trim(),
  description: z.string().trim()
});

export type RoomCreationFormData = z.infer<typeof roomCreationSchema>;
