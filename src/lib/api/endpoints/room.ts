import { api } from "@/lib/api";
import type {
  ApiBaseResponse,
  ApiPaginatedResponse,
  QueryParams,
  RoomInput,
  RoomType,
  RoomUserType,
  RoomQuery,
  RoomUsersQuery,
  RoomUserRole
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

  list: (query?: RoomQuery): Promise<ApiPaginatedResponse<RoomType[]>> => {
    return api.get<RoomType[], ApiPaginatedResponse<RoomType[]>>(`/rooms`, {
      params: query
    });
  },

  show: (id: string): Promise<ApiBaseResponse<RoomType>> => {
    return api.get(`/rooms/${id}`);
  },

  usersList: (
    id: string,
    query?: RoomUsersQuery
  ): Promise<ApiPaginatedResponse<RoomUserType[]>> => {
    return api.get<RoomUserType[], ApiPaginatedResponse<RoomUserType[]>>(
      `/rooms/${id}/users`,
      { params: query }
    );
  },

  currentRoomUser: (roomId: string): Promise<ApiBaseResponse<RoomUserType>> => {
    return api.get(`/rooms/${roomId}/users/current`);
  },

  updateUserRole: (
    roomId: string,
    userId: string,
    role: RoomUserRole
  ): Promise<ApiBaseResponse<RoomUserType>> => {
    return api.put(`/rooms/${roomId}/users/${userId}/role`, { role });
  }
} as const;
