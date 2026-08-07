import {
  model,
  models,
  Schema,
  Types,
  HydratedDocument,
  Model,
} from "mongoose";

export interface ICollection {
  author: Types.ObjectId;
  question: Types.ObjectId;
}

export type ICollectionDoc = HydratedDocument<ICollection>;

const CollectionSchema = new Schema<ICollection>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  },
  { timestamps: true }
);

const Collection: Model<ICollection> =
  (models.Collection as Model<ICollection>) ||
  model<ICollection>("Collection", CollectionSchema);

export default Collection;
