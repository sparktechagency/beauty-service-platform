import { model, Schema } from "mongoose";
import { BONUS_TYPE, IBonusAndChallenge } from "./bonusAndChallenge.interface";
import { BONUS_USER_TYPE } from "../../../enums/bonus";

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
      required: false,
      default: 0,
    },
    number: {
      type: Number,
      required: false,
      default: 0,
    },
    role: {
      type: String,
      enum: ["USER", "ARTIST"],
      required: true,
    },
    recipint: {
      type: String,
      enum: Object.values(BONUS_USER_TYPE),
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(BONUS_TYPE),
      required: true,
    },
    seenBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tekenUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ]
  },
  { timestamps: true }
);
export const BonusAndChallenge = model<IBonusAndChallenge>(
  "bonusAndChallenge",
  IBonusAndChallenge
);
