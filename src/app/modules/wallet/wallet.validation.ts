import { z } from "zod";
import { WITHDRAW_STATUS } from "../../../enums/withdraw";

const createApplyWithdrawZodSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Amount is required' }).refine((value) => value > 0, {
      message: 'Amount must be greater than 0',
  })
  }),
});

const createAcceptorRejectWithdrawZodSchema = z.object({
  body: z.object({
    status: z.nativeEnum(WITHDRAW_STATUS)
  }),
});
export const WalletValidation = {
  createApplyWithdrawZodSchema,
  createAcceptorRejectWithdrawZodSchema,
};