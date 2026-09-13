import { api } from "@/lib/api";
import type {
  ApiBaseResponse,
  ApiPaginatedResponse,
  RoomType,
  RoomUserType,
  RoomQuery,
  RoomUsersQuery,
  RoomUserRole,
  BlockedUsersQuery,
  QueryParams,
  UserType
} from "@/lib/api/types";

export const roomApi = {
  create: (input: FormData): Promise<ApiBaseResponse<RoomType>> => {
    return api.post("/rooms", input);
  },

  update: (id: string, input: FormData): Promise<ApiBaseResponse<RoomType>> => {
    return api.put(`/rooms/${id}`, input);
  },

  updatePrivateCode: (id: number): Promise<ApiBaseResponse<unknown>> => {
    return api.patch(`/rooms/${id}/private-code`);
  },

  join: (
    id: string,
    privateCode?: string
  ): Promise<ApiBaseResponse<RoomUserType>> => {
    return api.post(`/rooms/${id}/users`, { privateCode: privateCode ?? "" });
  },

  list: (
    query?: RoomQuery,
    signal?: AbortSignal
  ): Promise<ApiPaginatedResponse<RoomType[]>> => {
    return api.get<RoomType[], ApiPaginatedResponse<RoomType[]>>(`/rooms`, {
      params: query,
      signal
    });
  },

  show: (id: string): Promise<ApiBaseResponse<RoomType>> => {
    return api.get(`/rooms/${id}`);
  },

  usersList: (
    id: string,
    query?: RoomUsersQuery,
    signal?: AbortSignal
  ): Promise<ApiPaginatedResponse<RoomUserType[]>> => {
    return api.get<RoomUserType[], ApiPaginatedResponse<RoomUserType[]>>(
      `/rooms/${id}/users`,
      { params: query, signal }
    );
  },

  raisedHandsList: (
    id: string,
    query?: QueryParams,
    signal?: AbortSignal
  ): Promise<ApiPaginatedResponse<RoomUserType[]>> => {
    return api.get<RoomUserType[], ApiPaginatedResponse<RoomUserType[]>>(
      `/rooms/${id}/users/raised-hands`,
      { params: query, signal }
    );
  },

  blockedUsersList: (
    id: string,
    query?: BlockedUsersQuery,
    signal?: AbortSignal
  ): Promise<ApiPaginatedResponse<UserType[]>> => {
    return api.get<UserType[], ApiPaginatedResponse<UserType[]>>(
      `/rooms/${id}/blocks`,
      { params: query, signal }
    );
  },

  currentRoomUser: (roomId: string): Promise<ApiBaseResponse<RoomUserType>> => {
    return api.get(`/rooms/${roomId}/users/current`);
  },

  updateUserRole: (
    roomId: string,
    userId: number,
    role: RoomUserRole
  ): Promise<ApiBaseResponse<RoomUserType>> => {
    return api.put(`/rooms/${roomId}/users/${userId}/role`, { role });
  },

  deleteUser: (
    roomId: string,
    userId: number
  ): Promise<ApiBaseResponse<unknown>> => {
    return api.delete(`/rooms/${roomId}/users/${userId}`);
  },

  setUserMuted: (
    roomId: string,
    userId: number
  ): Promise<ApiBaseResponse<unknown>> => {
    return api.put(`/rooms/${roomId}/users/${userId}/mute`);
  },

  blockUser: (
    roomId: string,
    userId: number
  ): Promise<ApiBaseResponse<unknown>> => {
    return api.patch(`/rooms/${roomId}/blocks/${userId}`);
  },

  unblockUser: (
    roomId: string,
    userId: number
  ): Promise<ApiBaseResponse<unknown>> => {
    return api.delete(`/rooms/${roomId}/blocks/${userId}`);
  }
} as const;
