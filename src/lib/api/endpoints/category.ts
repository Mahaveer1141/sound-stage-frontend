import { api } from "@/lib/api";
import type { ApiBaseResponse, CategoryType } from "@/lib/api/types";

export const categoryApi = {
  list: (): Promise<ApiBaseResponse<CategoryType[]>> => {
    return api.get<CategoryType[]>("/categories", {
      revalidate: 604800,
      tags: ["categories"]
    });
  }
} as const;
