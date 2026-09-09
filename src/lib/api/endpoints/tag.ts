import { api } from "@/lib/api";
import type {
  ApiPaginatedResponse,
  QueryParams,
  TagQuery,
  TagType
} from "@/lib/api/types";

export const tagApi = {
  list: (query?: TagQuery): Promise<ApiPaginatedResponse<TagType[]>> => {
    return api.get<TagType[], ApiPaginatedResponse<TagType[]>>("/tags", {
      params: query
    });
  }
} as const;
