"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import db from "@/db";
import paths from "@/paths";
import { eq } from "drizzle-orm";
import { posts, topics } from "@/db/schema";

const createPostSchema = z.object({
	title: z.string().min(3),
	content: z.string().min(10),
});

interface CreatePostFormState {
	errors: {
		title?: string[];
		content?: string[];
		_form?: string[];
	};
}

export async function createPost(
	slug: string,
	formState: CreatePostFormState,
	formData: FormData,
): Promise<CreatePostFormState> {
	const result = createPostSchema.safeParse({
		title: formData.get("title"),
		content: formData.get("content"),
	});

	if (!result.success) {
		return {
			errors: result.error.flatten().fieldErrors,
		};
	}

	const session = await auth();
	if (!session || !session.user) {
		return {
			errors: {
				_form: ["You must be signed in to do this"],
			},
		};
	}

	const topic = await db.query.topics.findFirst({
		where: eq(topics.slug, slug),
	});

	if (!topic) {
		return {
			errors: {
				_form: ["Cannot find topic"],
			},
		};
	}

	let post: typeof posts.$inferSelect;
	try {
		const insertResult = await db
			.insert(posts)
			.values({
				title: result.data.title,
				content: result.data.content,
				// biome-ignore lint/style/noNonNullAssertion: <user will have id>
				userId: session.user.id!,
				topicId: topic.id,
			})
			.returning();

		if (!insertResult.length) {
			throw new Error("Failed to create post");
		}
		post = insertResult[0];
	} catch (err: unknown) {
		if (err instanceof Error) {
			return {
				errors: {
					_form: [err.message],
				},
			};
		}
		return {
			errors: {
				_form: ["Failed to create post"],
			},
		};
	}

	revalidatePath(paths.topicShow(slug));

	redirect(paths.postShow(slug, post.id));
}
