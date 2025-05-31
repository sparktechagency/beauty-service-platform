import { z } from "zod"

const createReportZodSchema = z.object({
    body: z.object({
        reservation: z.string({ required_error: 'Service Object Id is required' }).optional(),
        reason: z.string({ required_error: 'Reason is required' }),
    })  
})

const changeReportStatusZodSchema = z.object({
    body: z.object({
        refund: z.number({ required_error: 'Refund is required' }).optional(),
        note: z.string({ required_error: 'Note is required' }).optional(),
    })
})

const createSupportMessageZodSchema = z.object({
    body: z.object({
        message: z.string({ required_error: 'Message is required' }),
    })
})

const changeSupportStatusZodSchema = z.object({
    body: z.object({
        reply: z.string({ required_error: 'Reply is required' }),
    })
})

export const ReportValidation = {createReportZodSchema, changeReportStatusZodSchema, createSupportMessageZodSchema, changeSupportStatusZodSchema}