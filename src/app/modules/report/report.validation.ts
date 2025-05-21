import { z } from "zod"

const createReportZodSchema = z.object({
    body: z.object({
        customer: z.string({ required_error: 'Customer Object Id is required' }).optional(),
        reservation: z.string({ required_error: 'Service Object Id is required' }).optional(),
        reason: z.array(z.string({ required_error: 'Reason is required' })).optional(),
        artist: z.string({ required_error: 'Artist Object Id is required' }),
    })  
})

const changeReportStatusZodSchema = z.object({
    body: z.object({
        status: z.enum(["pending", "resolved"], { required_error: 'Status is required' }),
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