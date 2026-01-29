import type { Artwork } from "../types/art";


const BASE_URL = "https://api.artic.edu/api/v1/artworks";

export async function fetchArtworks(
  page: number,
  limit: number
): Promise<{ rows: Artwork[]; totalRecords: number }> {
  const response = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch artworks");
  }

  const json = await response.json();

  return {
    rows: json.data as Artwork[],
    totalRecords: json.pagination.total as number,
  };
}
