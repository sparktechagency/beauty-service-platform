import { z } from "zod"

const reviewZodSchema = z.object({
    body: z.object({
        order: z.string({ required_error: 'Service is required' }),
        rating: z.number({ required_error: 'Rating is required' }),
        comment: z.string({ required_error: 'Comment is required' }),
    })  
})

const getAllReviewsZodSchema = z.object({
    query: z.object({
        service: z.string({ required_error: 'Service is required' }),
        artist: z.string({ required_error: 'Artist is required' }),
    })
})

export const ReviewValidation = {reviewZodSchema,getAllReviewsZodSchema}