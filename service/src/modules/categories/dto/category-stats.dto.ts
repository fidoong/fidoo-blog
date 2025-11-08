export interface CategoryStatsDto {
  categoryId: string;
  postCount: number;
  totalViews: number;
  totalLikes: number;
  tagCount: number;
  latestPostAt: string | null;
}

