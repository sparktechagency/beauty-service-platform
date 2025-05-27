import { z } from 'zod';
import { ADMIN_BADGE, USER_ROLES } from '../../../enums/user';

const createAdminZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }),
        password: z.string({ required_error: 'Password is required' }),
        badge:z.nativeEnum(ADMIN_BADGE)
    })
});

export const AdminValidation = {
    createAdminZodSchema,
};
