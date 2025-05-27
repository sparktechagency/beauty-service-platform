import { z } from 'zod';

const createAdminZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }),
        password: z.string({ required_error: 'Password is required' }),
        role: z.string({ required_error: 'Role is required' })
    })
});

const createUserZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }),
        password: z.string({ required_error: 'Password is required' }),
        role: z.string({ required_error: 'Role is required' }),
        contact: z.string({ required_error: 'Contact is required' }),
        location: z.string({ required_error: 'Location is required' }).optional(),
        dateOfBirth: z.string({ required_error: 'Date of birth is required' }).optional(),
        nickName: z.string({ required_error: 'Nick name is required' }).optional(),
        social: z.string({ required_error: 'Social is required' }).optional(),
        description: z.string({ required_error: 'Description is required' }).optional(),
        profile: z.string({ required_error: 'Profile is required' }).optional(),
        referralCode: z.string({ required_error: 'Referral code is required' }).optional(),
        })
})

const createDeletePasswordZodSchema = z.object({
    body: z.object({
        password: z.string({ required_error: 'Password is required' }),
    })
});

const addCategoriesZodSchema = z.object({
    body: z.object({
        categories: z.array(z.string({ required_error: 'Category is required' }))
    })
});

export const UserValidation = { createAdminZodSchema,createDeletePasswordZodSchema,createUserZodSchema,addCategoriesZodSchema };  