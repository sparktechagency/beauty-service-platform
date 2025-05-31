import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { ADMIN_BADGE, USER_ROLES } from '../../../enums/user';
import { IUser, UserModal } from './user.interface';
import ApiError from '../../../errors/ApiErrors';
import stripe from '../../../config/stripe';
import Stripe from 'stripe';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    location: {
      type: String,
      required: false,
    },
    profile: {
      type: String,
      default: "/default/profile.jpg",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    contact: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    nickName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
    },
    social: {
      type: String,
    },
    accountInfo: {
      type: {
        stripeAccountId: String,
        stripeAccountLink: String,
        status: String,
        loginLink: String,
      },
      default: null,
    },
    reffralCodeDB: {
      type: String,
    },
    badge: {
      type: String,
      enum: Object.values(ADMIN_BADGE),
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    state: {
      type: String,
    },
    deviceToken: {
      type: String,
    },
    ssn: {
      type: String,
    },
    candidateId: {
      type: String,
    },
    reportId: {
      type: String,
    },
    city: {
      type: String,
    },
    zipCode: {
      type: String,
    },
     
  },
  { timestamps: true }
);
//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

userSchema.statics.HandleConnectStripe = async (data: Stripe.Account) => {
  // Find the user by Stripe account ID

  const existingUser = await User.findOne({
    email: data.email,
  });

  if (!existingUser) {
    // throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    console.log("user not found");
    return;
  }

  // Check if the onboarding is complete

  const loginLink = await stripe.accounts.createLoginLink(data.id);
  // Save Stripe account information to the user record
  await User.findOneAndUpdate(
    { _id: existingUser?._id },
    {
      $set: {
        "accountInfo.loginLink": loginLink.url,
      },
    },
    { new: true }
  );
};

//check user
userSchema.pre("save", async function (next) {
  //check user
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exist!");
  }

  if(this.ssn){
    const ssnExist = await User.findOne({ ssn: this.ssn });
    if (ssnExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "SSN already exist!");
    }
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const User = model<IUser, UserModal>("User", userSchema);
