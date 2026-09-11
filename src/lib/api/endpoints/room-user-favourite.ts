import { api } from "@/lib/api";
import type {
  ApiBaseResponse,
  ApiPaginatedResponse,
  RoomType
} from "@/lib/api/types";

export const roomUserFavouriteApi = {
  add: (roomId: number): Promise<ApiBaseResponse<unknown>> => {
    return api.post("/users/current/favorites", { roomId });
  },

  remove: (roomId: number): Promise<ApiBaseResponse<unknown>> => {
    return api.delete(`/users/current/favorites/${roomId}`);
  }
} as const;
