import { api } from "@/lib/api";
import type {
  ApiBaseResponse,
  ApiPaginatedResponse,
  RoomInput,
  RoomType
} from "@/lib/api/types";

export const roomApi = {
  create: (input: RoomInput): Promise<ApiBaseResponse<RoomType>> => {
    return api.post("/rooms", input);
  },

  update: (
    id: string,
    input: RoomInput
  ): Promise<ApiBaseResponse<RoomType>> => {
    return api.put(`/rooms/${id}`, input);
  },

  list: (): Promise<ApiPaginatedResponse<RoomType[]>> => {
    return api.get<RoomType[], ApiPaginatedResponse<RoomType[]>>(`/rooms`);
  },

  show: (id: string): Promise<ApiBaseResponse<RoomType>> => {
    return api.get(`/rooms/${id}`);
  }
} as const;
