import { model, Schema } from "mongoose";
import { IBonusAndChallenge } from "./bonusAndChallenge.interface";

const IBonusAndChallenge = new Schema<IBonusAndChallenge>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ARTIST"],
      required: true,
    },
    recipint: {
      type: String,
      enum: ["USER", "ARTIST"],
      required: true,
    },
  },
  { timestamps: true }
);
export const BonusAndChallenge = model<IBonusAndChallenge>(
  "bonusAndChallenge",
  IBonusAndChallenge
);
