import {
	boolean,
	integer,
	pgTable,
	serial,
	timestamp,
	text,
	primaryKey,
	type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";

export const users = pgTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	image: text("image"),
});

export const userRelations = relations(users, ({ many }) => {
	return {
		accounts: many(accounts),
		sessions: many(sessions),
		posts: many(posts),
		comments: many(comments),
	};
});

export const accounts = pgTable(
	"account",
	{
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<AdapterAccount>().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	}),
);

export const accountRelations = relations(accounts, ({ one }) => {
	return {
		user: one(users, {
			fields: [accounts.userId],
			references: [users.id],
		}),
	};
});

export const sessions = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const sessionRelations = relations(sessions, ({ one }) => {
	return {
		user: one(users, {
			fields: [sessions.userId],
			references: [users.id],
		}),
	};
});

export const verificationTokens = pgTable(
	"verificationToken",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(verificationToken) => ({
		compositePk: primaryKey({
			columns: [verificationToken.identifier, verificationToken.token],
		}),
	}),
);

export const authenticators = pgTable(
	"authenticator",
	{
		credentialID: text("credentialID").notNull().unique(),
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		providerAccountId: text("providerAccountId").notNull(),
		credentialPublicKey: text("credentialPublicKey").notNull(),
		counter: integer("counter").notNull(),
		credentialDeviceType: text("credentialDeviceType").notNull(),
		credentialBackedUp: boolean("credentialBackedUp").notNull(),
		transports: text("transports"),
	},
	(authenticator) => ({
		compositePK: primaryKey({
			columns: [authenticator.userId, authenticator.credentialID],
		}),
	}),
);

export const topics = pgTable("topics", {
	id: serial("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	description: text("description").notNull(),
});

export const topicRelations = relations(topics, ({ many }) => {
	return {
		posts: many(posts),
	};
});

export const posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	content: text("content").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	topicId: integer("topicId")
		.notNull()
		.references(() => topics.id),
});

export const postRelations = relations(posts, ({ one, many }) => {
	return {
		user: one(users, {
			fields: [posts.userId],
			references: [users.id],
		}),
		topic: one(topics, {
			fields: [posts.topicId],
			references: [topics.id],
		}),
		comments: many(comments),
	};
});

export const comments = pgTable("comments", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	postId: integer("postId")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	parentId: integer("parentId").references((): AnyPgColumn => comments.id, {
		onDelete: "cascade",
	}),
});

export const commentRelations = relations(comments, ({ one, many }) => {
	return {
		parent: one(comments, {
			fields: [comments.parentId],
			references: [comments.id],
		}),
		children: many(comments),
		post: one(posts, {
			fields: [comments.postId],
			references: [posts.id],
		}),
		user: one(users, {
			fields: [comments.userId],
			references: [users.id],
		}),
	};
});
