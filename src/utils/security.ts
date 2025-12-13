import DOMPurify from 'dompurify';
import validator from 'validator';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
};

/**
 * Sanitize plain text (strip all HTML)
 */
export const sanitizeText = (text: string): string => {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export const sanitizeUrl = (url: string): string => {
    const sanitized = DOMPurify.sanitize(url);

    // Block dangerous protocols
    if (
        sanitized.startsWith('javascript:') ||
        sanitized.startsWith('data:') ||
        sanitized.startsWith('vbscript:')
    ) {
        return '';
    }

    return sanitized;
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
    const sanitized = sanitizeText(email.trim().toLowerCase());
    return validator.isEmail(sanitized) ? sanitized : '';
};

/**
 * Validate and sanitize phone number
 */
export const sanitizePhone = (phone: string): string => {
    // Remove all non-digit characters except +
    const sanitized = phone.replace(/[^\d+]/g, '');
    return validator.isMobilePhone(sanitized, 'any') ? sanitized : '';
};

/**
 * Sanitize user input for search queries
 */
export const sanitizeSearchQuery = (query: string): string => {
    // Remove special characters that could be used for injection
    return sanitizeText(query)
        .replace(/[<>'"]/g, '')
        .trim()
        .slice(0, 200); // Limit length
};

/**
 * Sanitize filename to prevent path traversal
 */
export const sanitizeFilename = (filename: string): string => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .slice(0, 255);
};

/**
 * Escape HTML entities
 */
export const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validate input length
 */
export const validateLength = (
    value: string,
    min: number,
    max: number
): { valid: boolean; error?: string } => {
    if (value.length < min) {
        return { valid: false, error: `Minimum ${min} characters required` };
    }
    if (value.length > max) {
        return { valid: false, error: `Maximum ${max} characters allowed` };
    }
    return { valid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (
    password: string
): { valid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } => {
    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters', strength: 'weak' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength =
        hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
            ? 'strong'
            : hasUpperCase && hasLowerCase && (hasNumbers || hasSpecialChar)
                ? 'medium'
                : 'weak';

    if (strength === 'weak') {
        return {
            valid: false,
            error: 'Password must contain uppercase, lowercase, and numbers or special characters',
            strength,
        };
    }

    return { valid: true, strength };
};

/**
 * Validate URL
 */
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
        return { valid: false, error: 'Invalid URL format' };
    }
    return { valid: true };
};

/**
 * Validate credit card (basic check)
 */
export const validateCreditCard = (cardNumber: string): { valid: boolean; error?: string } => {
    const sanitized = cardNumber.replace(/\s/g, '');
    if (!validator.isCreditCard(sanitized)) {
        return { valid: false, error: 'Invalid credit card number' };
    }
    return { valid: true };
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeText(value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map((item) =>
                typeof item === 'string' ? sanitizeText(item) : item
            );
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
};

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
    private timestamps: number[] = [];
    private limit: number;
    private window: number;

    constructor(limit: number, windowMs: number) {
        this.limit = limit;
        this.window = windowMs;
    }

    canProceed(): boolean {
        const now = Date.now();
        this.timestamps = this.timestamps.filter((ts) => now - ts < this.window);

        if (this.timestamps.length >= this.limit) {
            return false;
        }

        this.timestamps.push(now);
        return true;
    }

    reset(): void {
        this.timestamps = [];
    }
}

/**
 * Content Security Policy helper
 */
export const generateNonce = (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};
