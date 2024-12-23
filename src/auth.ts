import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import db from "@/db";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
	throw new Error("Missing github oauth credentials");
}

const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth({
	adapter: DrizzleAdapter(db),
	providers: [
		Github({
			clientId: GITHUB_CLIENT_ID,
			clientSecret: GITHUB_CLIENT_SECRET,
		}),
	],
	callbacks: {
		// usually not needed, here fixing a bug in nextauth
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		async session({ session, user }: any) {
			if (session && user) session.user.id = user.id;
			return session;
		},
	},
});

export { GET, POST, auth, signIn, signOut };
