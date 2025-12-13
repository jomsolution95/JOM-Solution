import { z } from 'zod';
import { sanitizeEmail, sanitizePhone, validatePassword, validateLength } from './security';

/**
 * Form validation schemas using Zod
 */

// Login form
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .transform(sanitizeEmail),
    password: z.string().min(1, 'Password is required'),
});

// Registration form
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .transform(sanitizeEmail),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .refine(
            (val) => validatePassword(val).valid,
            'Password must contain uppercase, lowercase, and numbers or special characters'
        ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Profile update form
export const profileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Invalid email format').transform(sanitizeEmail),
    phone: z
        .string()
        .optional()
        .transform((val) => (val ? sanitizePhone(val) : val)),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// Service creation form
export const serviceSchema = z.object({
    title: z
        .string()
        .min(10, 'Title must be at least 10 characters')
        .max(100, 'Title must be less than 100 characters'),
    description: z
        .string()
        .min(50, 'Description must be at least 50 characters')
        .max(5000, 'Description must be less than 5000 characters'),
    category: z.string().min(1, 'Category is required'),
    price: z
        .number()
        .min(500, 'Price must be at least 500 FCFA')
        .max(10000000, 'Price must be less than 10,000,000 FCFA'),
    deliveryTime: z
        .number()
        .min(1, 'Delivery time must be at least 1 day')
        .max(365, 'Delivery time must be less than 365 days'),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
    images: z
        .array(z.string().url('Invalid image URL'))
        .min(1, 'At least one image is required')
        .max(5, 'Maximum 5 images allowed'),
});

// Job posting form
export const jobSchema = z.object({
    title: z
        .string()
        .min(10, 'Title must be at least 10 characters')
        .max(100, 'Title must be less than 100 characters'),
    description: z
        .string()
        .min(100, 'Description must be at least 100 characters')
        .max(10000, 'Description must be less than 10,000 characters'),
    location: z.string().min(2, 'Location is required').max(100),
    type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
    salary: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
        currency: z.string().default('FCFA'),
    }),
    requirements: z.array(z.string()).max(20, 'Maximum 20 requirements'),
});

// Contact form
export const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email format').transform(sanitizeEmail),
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
    message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
});

// Payment form
export const paymentSchema = z.object({
    amount: z.number().min(100, 'Amount must be at least 100 FCFA'),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .transform(sanitizePhone)
        .refine((val) => val !== '', 'Invalid phone number'),
    method: z.enum(['wave', 'orange_money', 'card']),
});

// Review form
export const reviewSchema = z.object({
    rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
    comment: z
        .string()
        .min(10, 'Comment must be at least 10 characters')
        .max(1000, 'Comment must be less than 1000 characters'),
});

/**
 * Generic form validator
 */
export const validateForm = <T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {};
            error.errors.forEach((err) => {
                const path = err.path.join('.');
                errors[path] = err.message;
            });
            return { success: false, errors };
        }
        return { success: false, errors: { _form: 'Validation failed' } };
    }
};

/**
 * Real-time field validator
 */
export const validateField = <T>(
    schema: z.ZodSchema<T>,
    fieldName: string,
    value: any
): string | null => {
    try {
        const fieldSchema = (schema as any).shape[fieldName];
        if (fieldSchema) {
            fieldSchema.parse(value);
        }
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.errors[0]?.message || 'Invalid value';
        }
        return 'Validation error';
    }
};
