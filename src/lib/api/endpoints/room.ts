import { api } from "@/lib/api";
import type {
  PaginatedApiResponse,
  ApiResponse,
  RoomInput,
  RoomType
} from "@/lib/api/types";

export const roomApi = {
  create: (input: RoomInput): Promise<ApiResponse<RoomType>> => {
    return api.post("/rooms", input);
  },

  update: (id: string, input: RoomInput): Promise<ApiResponse<RoomType>> => {
    return api.put(`/rooms/${id}`, input);
  },

  list: (): Promise<PaginatedApiResponse<RoomType[]>> => {
    return api.get(`/rooms`);
  },

  show: (id: string): Promise<ApiResponse<RoomType>> => {
    return api.get(`/rooms/${id}`);
  }
} as const;
