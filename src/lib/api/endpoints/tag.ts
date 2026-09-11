import { api } from "@/lib/api";
import type {
  ApiBaseResponse,
  ApiPaginatedResponse,
  TagQuery,
  TagType
} from "@/lib/api/types";

export const tagApi = {
  list: (query?: TagQuery): Promise<ApiPaginatedResponse<TagType[]>> => {
    return api.get<TagType[], ApiPaginatedResponse<TagType[]>>("/tags", {
      params: query
    });
  },
  create: (name: string): Promise<ApiBaseResponse<TagType>> => {
    return api.post("/tags", { name });
  }
} as const;
