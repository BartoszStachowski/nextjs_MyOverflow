import { model, models, Schema, Types, HydratedDocument } from "mongoose";

export interface ITagQuestion {
  tag: Types.ObjectId;
  question: Types.ObjectId;
}

export type ITagQuestionDoc = HydratedDocument<ITagQuestion>;

const TagQuestionSchema = new Schema<ITagQuestion>({
  tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
  question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
});

const TagQuestion =
  models?.TagQuestion || model<ITagQuestion>("TagQuestion", TagQuestionSchema);

export default TagQuestion;
