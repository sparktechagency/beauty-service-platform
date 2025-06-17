import axios from "axios";
import { JwtPayload } from "jsonwebtoken";
import config from "../../../config";

const verifyAppleReciept = async (receipt: string,user:JwtPayload) => {
    const response = await axios.post('https://sandbox.itunes.apple.com/verifyReceipt', {
    'receipt-data': receipt,
    'password': config.apple.password,
    'exclude-old-transactions': true
  });
  const data = response.data;
  
};