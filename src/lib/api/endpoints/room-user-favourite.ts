import { api } from "@/lib/api";
import type {
  ApiBaseResponse,
  ApiPaginatedResponse,
  RoomType
} from "@/lib/api/types";

export const roomUserFavouriteApi = {
  list: (
    page = 1,
    perPage = 10
  ): Promise<ApiPaginatedResponse<RoomType[]>> => {
    return api.get<RoomType[], ApiPaginatedResponse<RoomType[]>>(
      "/users/current/favorites",
      { params: { page, perPage } }
    );
  },

  add: (roomId: string): Promise<ApiBaseResponse<unknown>> => {
    return api.post("/users/current/favorites", { roomId: Number(roomId) });
  },

  remove: (roomId: string): Promise<ApiBaseResponse<unknown>> => {
    return api.delete(`/users/current/favorites/${roomId}`);
  }
} as const;
