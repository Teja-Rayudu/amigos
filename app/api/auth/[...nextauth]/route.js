import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;

        // Validate input
        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
          return null;
        }

        // Sanitize email
        const sanitizedEmail = email.trim().toLowerCase().slice(0, 255);

        try {
          await connectToDatabase();
          // Use the static method to get user with password
          const user = await User.findByEmailWithPassword(sanitizedEmail);

          if (!user) {
            // Don't expose whether user exists or not - security best practice
            if (process.env.NODE_ENV === 'development') {
              console.log("Authentication failed: Invalid credentials");
            }
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            // Don't expose whether password is wrong or user doesn't exist
            if (process.env.NODE_ENV === 'development') {
              console.log("Authentication failed: Invalid credentials");
            }
            return null;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log("✅ Authentication successful");
          }
          // Return user without password for session
          return {
            id: user._id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("❌ NextAuth authorize error:", error.message);
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/api/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Include user ID in token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Include user ID in session
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };