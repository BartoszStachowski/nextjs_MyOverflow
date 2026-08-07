import { model, models, Schema, HydratedDocument, Model } from "mongoose";

export interface IUser {
  name: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  location?: string;
  portfolio?: string;
  reputation?: number;
}

export type IUserDoc = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    image: { type: String },
    location: { type: String },
    portfolio: { type: String },
    reputation: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "user",
  }
);

const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", UserSchema);

export default User;
