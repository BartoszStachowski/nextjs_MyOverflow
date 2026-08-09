import {
  model,
  models,
  Schema,
  Types,
  HydratedDocument,
  Model,
} from "mongoose";

export interface IVote {
  author: Types.ObjectId;
  actionId: Types.ObjectId;
  actionType: "question" | "answer";
  voteType: "upvote" | "downvote";
}

export type IVoteDoc = HydratedDocument<IVote>;

const VoteSchema = new Schema<IVote>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actionId: { type: Schema.Types.ObjectId, required: true },
    actionType: { type: String, enum: ["question", "answer"], required: true },
    voteType: { type: String, enum: ["upvote", "downvote"], required: true },
  },
  { timestamps: true }
);

VoteSchema.index(
  {
    author: 1,
    actionId: 1,
    actionType: 1,
  },
  {
    unique: true,
  }
);

const Vote: Model<IVote> =
  (models.Vote as Model<IVote>) || model<IVote>("Vote", VoteSchema);

export default Vote;
