"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import db from "@/db";
import paths from "@/paths";
import { topics } from "@/db/schema";

const createTopicSchema = z.object({
	name: z
		.string()
		.min(3)
		.regex(/[a-z-]/, {
			message: "Must be lowercase letters or dashes without spaces",
		}),
	description: z.string().min(10),
});

interface CreateTopicFormState {
	errors: {
		name?: string[];
		description?: string[];
		_form?: string[];
	};
}

export async function createTopic(
	formState: CreateTopicFormState,
	formData: FormData,
): Promise<CreateTopicFormState> {
	const result = createTopicSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
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
				_form: ["You must be signed in to do this."],
			},
		};
	}

	let topic: typeof topics.$inferSelect;
	try {
		const topicResult = await db
			.insert(topics)
			.values({
				slug: result.data.name,
				description: result.data.description,
			})
			.returning();

		if (!topicResult) {
			throw new Error("Failed to create topic");
		}
		topic = topicResult[0];
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
				_form: ["Something went wrong"],
			},
		};
	}

	revalidatePath("/");

	redirect(paths.topicShow(topic.slug));
}
