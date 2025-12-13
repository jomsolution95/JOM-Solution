import React, { useState, useEffect } from 'react';
import { validateField } from '../utils/validation';
import { z } from 'zod';

interface UseFormValidationProps<T> {
    schema: z.ZodSchema<T>;
    initialValues: Partial<T>;
    onSubmit: (data: T) => void | Promise<void>;
}

export const useFormValidation = <T extends Record<string, any>>({
    schema,
    initialValues,
    onSubmit,
}: UseFormValidationProps<T>) => {
    const [values, setValues] = useState<Partial<T>>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validate single field
    const validateSingleField = (name: string, value: any) => {
        const error = validateField(schema, name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error || '',
        }));
    };

    // Handle field change
    const handleChange = (name: string, value: any) => {
        setValues((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Validate on change if field has been touched
        if (touched[name]) {
            validateSingleField(name, value);
        }
    };

    // Handle field blur
    const handleBlur = (name: string) => {
        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }));

        // Validate on blur
        validateSingleField(name, values[name]);
    };

    // Handle form submit
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
        );
        setTouched(allTouched);

        // Validate all fields
        try {
            const validated = schema.parse(values);
            setErrors({});
            setIsSubmitting(true);

            try {
                await onSubmit(validated);
            } finally {
                setIsSubmitting(false);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    newErrors[path] = err.message;
                });
                setErrors(newErrors);
            }
            setIsSubmitting(false);
        }
    };

    // Reset form
    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    };

    // Set field value programmatically
    const setFieldValue = (name: string, value: any) => {
        handleChange(name, value);
    };

    // Set field error programmatically
    const setFieldError = (name: string, error: string) => {
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFieldValue,
        setFieldError,
    };
};

/**
 * Example usage:
 * 
 * const { values, errors, handleChange, handleBlur, handleSubmit } = useFormValidation({
 *   schema: loginSchema,
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (data) => {
 *     await login(data);
 *   },
 * });
 * 
 * <form onSubmit={handleSubmit}>
 *   <input
 *     value={values.email}
 *     onChange={(e) => handleChange('email', e.target.value)}
 *     onBlur={() => handleBlur('email')}
 *   />
 *   {errors.email && <span>{errors.email}</span>}
 * </form>
 */
