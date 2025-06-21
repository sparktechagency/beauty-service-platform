import axios from "axios";
import { JwtPayload } from "jsonwebtoken";
import config from "../../../config";
import { ObjectId } from "mongoose";
import { Subscription } from "../subscription/subscription.model";

export interface AppleReceiptResponse {
  status: number;
  environment: 'Sandbox' | 'Production';
  receipt: {
    receipt_type: string;
    bundle_id: string;
    in_app: AppleInAppTransaction[];
  };
  latest_receipt_info: AppleInAppTransaction[];
  latest_receipt: string;
}

export interface AppleInAppTransaction {
  quantity?: string;
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  purchase_date_ms: string; // as string, needs to be parsed with Number()
  expires_date_ms?: string;
  is_trial_period?: 'true' | 'false';
  is_in_intro_offer_period?: 'true' | 'false';
  auto_renew_status?: '0' | '1';
}


const verifyAppleReciept = async (receipt: string,userId:ObjectId) => {
    const response = await axios.post('https://sandbox.itunes.apple.com/verifyReceipt', {
    'receipt-data': receipt,
    'password': config.apple.password,
    'exclude-old-transactions': true
  });
  const data:AppleReceiptResponse = response.data;

  if(data.status !== 0) {
    throw new Error('Invalid receipt');
  }

  const existSubScription = await Subscription.findOne({
    user: userId,
    status: 'active',
  });

  if (existSubScription) {
    existSubScription.status = 'expired';
    await existSubScription.save();
  }
  const subscription = await Subscription.create({
    
  });

};