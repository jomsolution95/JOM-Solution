import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, X, Loader, CheckCircle } from 'lucide-react';
import { uploadFile, generatePreview } from '../utils/upload';
import { toast } from 'react-toastify';

export interface AvatarUploaderProps {
    currentAvatar?: string;
    onUploadComplete?: (url: string) => void;
    onUploadError?: (error: Error) => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
};

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
    currentAvatar,
    onUploadComplete,
    onUploadError,
    size = 'md',
    className = '',
}) => {
    const [preview, setPreview] = useState<string | undefined>(currentAvatar);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validate image
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Generate preview
        const previewUrl = await generatePreview(file);
        setPreview(previewUrl);

        // Upload
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const result = await uploadFile(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 512,
                onProgress: setUploadProgress,
            });

            setPreview(result.url);
            onUploadComplete?.(result.url);
            toast.success('Avatar updated successfully!');
        } catch (error) {
            setPreview(currentAvatar);
            onUploadError?.(error as Error);
            toast.error('Failed to upload avatar');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [currentAvatar, onUploadComplete, onUploadError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        },
        multiple: false,
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    const removeAvatar = () => {
        setPreview(undefined);
        onUploadComplete?.('');
    };

    return (
        <div className={`relative ${className}`}>
            <div
                {...getRootProps()}
                className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer group relative`}
            >
                <input {...getInputProps()} />

                {/* Avatar Image */}
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <Camera className="w-1/3 h-1/3 text-white opacity-50" />
                    </div>
                )}

                {/* Overlay */}
                <div
                    className={`absolute inset-0 bg-black transition-opacity flex items-center justify-center ${isDragActive || isUploading
                            ? 'bg-opacity-70'
                            : 'bg-opacity-0 group-hover:bg-opacity-50'
                        }`}
                >
                    {isUploading ? (
                        <div className="text-center">
                            <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                            <p className="text-white text-xs font-medium">{uploadProgress}%</p>
                        </div>
                    ) : isDragActive ? (
                        <Upload className="w-8 h-8 text-white" />
                    ) : (
                        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>

                {/* Success Indicator */}
                {!isUploading && preview && preview !== currentAvatar && (
                    <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1">
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>

            {/* Remove Button */}
            {preview && !isUploading && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeAvatar();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {/* Upload Hint */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                {isUploading ? 'Uploading...' : 'Click or drag to upload'}
            </p>
        </div>
    );
};
