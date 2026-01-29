

export type ArtworkId = string | number;

export interface Artwork {
  
  id: ArtworkId;

  
  title: string;
  image_url: string;

  
  artist?: string;
  year?: number;
  description?: string;
  tags?: string[];
  created_at?: string; // ISO string
  updated_at?: string; // ISO string
}

export interface Pagination {

  total: number;
  current_page: number;
  per_page: number;
  last_page: number;

  
  from?: number | null;
  to?: number | null;
  next_page?: number | null;
  prev_page?: number | null;
}

export interface ApiResponse<TData> {
  
  data: TData;

 
  pagination: Pagination;

 
  message?: string;
  status?: "ok" | "error";
  errors?: Record<string, string[]>;
}


export type ArtworkListResponse = ApiResponse<Artwork[]>;
export type ArtworkResponse = ApiResponse<Artwork>;
