"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import db from "@/db";
import paths from "@/paths";
import { comments, posts, topics } from "@/db/schema";
import { eq } from "drizzle-orm";

const createCommentSchema = z.object({
	content: z.string().min(3),
});

interface CreateCommentFormState {
	errors: {
		content?: string[];
		_form?: string[];
	};
	success?: boolean;
}

export async function createComment(
	{ postId, parentId }: { postId: number; parentId?: number },
	formState: CreateCommentFormState,
	formData: FormData,
): Promise<CreateCommentFormState> {
	const result = createCommentSchema.safeParse({
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
				_form: ["You must sign in to do this."],
			},
		};
	}

	try {
		await db
			.insert(comments)
			.values({
				content: result.data.content,
				postId: postId,
				parentId: parentId,
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				userId: session.user.id!,
			})
			.execute();
	} catch (err) {
		if (err instanceof Error) {
			return {
				errors: {
					_form: [err.message],
				},
			};
		}
		return {
			errors: {
				_form: ["Something went wrong..."],
			},
		};
	}

	const topic = await db.query.topics.findFirst({
		where: eq(
			topics.id,
			db
				.select({ id: posts.topicId })
				.from(posts)
				.where(eq(posts.id, postId))
				.limit(1),
		),
	});

	if (!topic) {
		return {
			errors: {
				_form: ["Failed to revalidate topic"],
			},
		};
	}

	revalidatePath(paths.postShow(topic.slug, postId));

	return {
		errors: {},
		success: true,
	};
}
