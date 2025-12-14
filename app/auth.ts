import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowedUser } from "./api/allowed-users/repository";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email && (await isAllowedUser(user.email))) {
        return true;
      }
      return "/?error=AccessDenied";
    },
  },
});
