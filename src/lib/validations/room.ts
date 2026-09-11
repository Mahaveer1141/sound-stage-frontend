import { z } from "zod";

export const roomFormSchema = z.object({
  name: z.string().trim().min(1, "Room name is required"),
  description: z.string().trim().optional(),
  type: z.enum(["public", "private"]).default("public"),
  isChatEnabled: z.boolean().default(true),
  categories: z
    .array(z.number())
    .max(3, "You can select up to 3 categories")
    .default([]),
  tags: z.array(z.number()).max(5, "You can select up to 5 tags").default([])
});

export type RoomFormData = z.infer<typeof roomFormSchema>;
