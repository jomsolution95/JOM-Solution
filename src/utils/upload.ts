import imageCompression from 'browser-image-compression';
import api from '../api/client';

export interface UploadOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    onProgress?: (progress: number) => void;
}

export interface UploadResult {
    url: string;
    publicId?: string;
    filename: string;
    size: number;
    type: string;
}

/**
 * Compress image before upload
 */
export const compressImage = async (
    file: File,
    options: UploadOptions = {}
): Promise<File> => {
    const {
        maxSizeMB = 1,
        maxWidthOrHeight = 1920,
        useWebWorker = true,
    } = options;

    // Only compress images
    if (!file.type.startsWith('image/')) {
        return file;
    }

    try {
        const compressedFile = await imageCompression(file, {
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker,
        });

        console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        return file;
    }
};

/**
 * Upload file to backend
 */
export const uploadFile = async (
    file: File,
    options: UploadOptions = {}
): Promise<UploadResult> => {
    const { onProgress } = options;

    // Compress if image
    const fileToUpload = file.type.startsWith('image/')
        ? await compressImage(file, options)
        : file;

    // Create form data
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress?.(progress);
                }
            },
        });

        return response.data;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (
    files: File[],
    options: UploadOptions = {}
): Promise<UploadResult[]> => {
    const uploadPromises = files.map(file => uploadFile(file, options));
    return Promise.all(uploadPromises);
};

/**
 * Validate file
 */
export const validateFile = (
    file: File,
    options: {
        maxSize?: number; // in bytes
        allowedTypes?: string[];
    } = {}
): { valid: boolean; error?: string } => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes } = options; // 10MB default

    // Check size
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
        };
    }

    // Check type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed`,
        };
    }

    return { valid: true };
};

/**
 * Generate preview URL for file
 */
export const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Check if file is image
 */
export const isImage = (file: File): boolean => {
    return file.type.startsWith('image/');
};

/**
 * Check if file is video
 */
export const isVideo = (file: File): boolean => {
    return file.type.startsWith('video/');
};

/**
 * Check if file is PDF
 */
export const isPDF = (file: File): boolean => {
    return file.type === 'application/pdf';
};
