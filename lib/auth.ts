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
        after: async (user) => {
          const fallbackUsername = slugify(user.email.split("@")[0], {
            lower: true,
            strict: true,
            trim: true,
          });

          await db.collection("profiles").insertOne({
            userId: user.id,
            username:
              user.username ?? `${fallbackUsername}-${user.id.slice(0, 6)}`,
            name: user.name,
            image: user.image,
            createdAt: new Date(),
          });
        },
      },
    },
  },
});
