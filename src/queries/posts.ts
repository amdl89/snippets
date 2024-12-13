import db from "@/db";
import { comments, posts, topics, type users } from "@/db/schema";
import { desc, eq, inArray, or, sql } from "drizzle-orm";

export type PostWithData = typeof posts.$inferSelect & {
	user: Partial<typeof users.$inferInsert>;
	topic: Partial<typeof topics.$inferInsert>;
	comments_count: number;
};

export async function fetchPostsByTopicSlug(
	slug: string,
): Promise<PostWithData[]> {
	return await db.query.posts.findMany({
		where: inArray(
			posts.topicId,
			db.select({ id: topics.id }).from(topics).where(eq(topics.slug, slug)),
		),
		with: {
			topic: {
				columns: {
					slug: true,
				},
			},
			user: {
				columns: {
					name: true,
				},
			},
		},
		extras: {
			comments_count:
				//  db
				//   .$count(comments, eq(comments.postId, posts.id))
				//   .as("comments_count"),
				sql<number>`(SELECT COUNT(*) FROM ${comments} WHERE "comments"."postId" = "posts"."id")`.as(
					"comments_count",
				),
		},
	});
}

export async function fetchTopPosts(): Promise<PostWithData[]> {
	return await db.query.posts.findMany({
		orderBy: [
			desc(
				// db.$count(comments, eq(comments.postId, posts.id)).as("comments_count")
				sql<number>`(SELECT COUNT(*) FROM ${comments} WHERE "comments"."postId" = "posts"."id")`.as(
					"comments_count",
				),
			),
		],
		with: {
			topic: { columns: { slug: true } },
			user: { columns: { name: true } },
		},
		extras: {
			comments_count:
				// db
				//   .$count(comments, eq(comments.postId, posts.id))
				//   .as("comments_count"),
				sql<number>`(SELECT COUNT(*) FROM ${comments} WHERE "comments"."postId" = "posts"."id")`.as(
					"comments_count",
				),
		},
		limit: 5,
	});
}

export async function fetchPostsBySearchTerm(
	term: string,
): Promise<PostWithData[]> {
	return await db.query.posts.findMany({
		where: or(eq(posts.title, term), eq(posts.content, term)),
		with: {
			topic: { columns: { slug: true } },
			user: { columns: { name: true } },
		},
		extras: {
			comments_count:
				// db
				//   .$count(comments, eq(comments.postId, posts.id))
				//   .as("comments_count"),
				sql<number>`(SELECT COUNT(*) FROM ${comments} WHERE  comments.postId = posts.id)`.as(
					"comments_count",
				),
		},
	});
}
