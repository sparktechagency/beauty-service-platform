import { model, Schema } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { IUser, UserModal } from "./user.interface";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";
import stripe from "../../../config/stripe";
import Stripe from "stripe";

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },
    contact: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
      select: 0,
      minlength: 8,
    },
    location: {
      type: String,
      required: false,
    },
    profile: {
      type: String,
      default:
        "https://res.cloudinary.com/dzo4husae/image/upload/v1733459922/zfyfbvwgfgshmahyvfyk.png",
    },
    backGroundImage: {
      type: String,
      required: false,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    social: {
      type: String,
      required: false,
    },
    license: {
      type: String,
      required: false,
    },
    workImage: {
      type: String,
      required: false,
    },
    nickName: {
      type: String,
      required: false,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
    accountInfo: {
      type:{
        stripeAccountId: String,
        stripeAccountLink: String,
        status: String,
        loginLink: String
      },
      default: null
    }
  },
  {
    timestamps: true,
  }
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

//account check
userSchema.statics.isAccountCreated = async (id: string) => {
  const isUserExist: any = await User.findById(id);
  return isUserExist.accountInformation.status;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

userSchema.statics.HandleConnectStripe = async (data:Stripe.Account) =>{
  // Find the user by Stripe account ID

  
  const existingUser = await User.findOne({
   email:data.email,
});


if (!existingUser) {
   // throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
   console.log('user not found')
   return
}


// Check if the onboarding is complete

   const loginLink = await stripe.accounts.createLoginLink(data.id);
   // Save Stripe account information to the user record
   await User.findOneAndUpdate(
     { _id: existingUser?._id },
     {
       $set: {
         'accountInfo.loginLink': loginLink.url,
       }
     },
     { new: true }
   );
   

}

//check user
userSchema.pre("save", async function (next) {
  //check user
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exist!");
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});
export const User = model<IUser, UserModal>("User", userSchema);
