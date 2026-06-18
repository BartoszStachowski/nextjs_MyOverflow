import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { db } from "@/lib/mongodb";
import slugify from "slugify";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  plugins: [nextCookies()],

  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_CLIENT_ID!,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.collection("profiles").insertOne({
            userId: user.id,
            username: slugify(user.name ?? user.email.split("@")[0], {
              lower: true,
              strict: true,
              trim: true,
            }),
            name: user.name,
            image: user.image,
            createdAt: new Date(),
          });
        },
      },
    },
  },
});
