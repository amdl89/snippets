import { cache } from "react";

import db from "@/db";
import { eq } from "drizzle-orm";
import { comments, users } from "@/db/schema";

export type CommentWithUser = typeof comments.$inferSelect & {
  user: Partial<typeof users.$inferInsert>;
};

// request memoization
export const fetchCommentsByPostId = cache(
  async (postId: number): Promise<CommentWithUser[]> => {
    return await db.query.comments.findMany({
      where: eq(comments.postId, postId),
      with: {
        user: {
          columns: {
            name: true,
            image: true,
          },
        },
      },
    });
  }
);
