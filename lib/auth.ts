import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { db } from "@/lib/mongodb";
import slugify from "slugify";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  plugins: [nextCookies(), username()],

  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_CLIENT_ID!,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.username) {
            return { data: user };
          }

          const fallbackUsername = slugify(user.email.split("@")[0], {
            lower: true,
            strict: true,
            trim: true,
          });

          return {
            data: {
              ...user,
              username: `${fallbackUsername}-${crypto.randomUUID().slice(0, 6)}`,
            },
          };
        },
      },
    },
  },
});
