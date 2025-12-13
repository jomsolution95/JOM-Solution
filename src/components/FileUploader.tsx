import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadFile, validateFile, formatFileSize, generatePreview, isImage } from '../utils/upload';
import { toast } from 'react-toastify';

export interface FileUploaderProps {
    onUploadComplete?: (url: string, file: File) => void;
    onUploadError?: (error: Error) => void;
    maxSize?: number; // in MB
    allowedTypes?: string[];
    accept?: Record<string, string[]>;
    multiple?: boolean;
    className?: string;
}

export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface FileWithPreview extends File {
    preview?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
    onUploadComplete,
    onUploadError,
    maxSize = 10,
    allowedTypes,
    accept,
    multiple = false,
    className = '',
}) => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState<string>('');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Validate files
        const validFiles: FileWithPreview[] = [];

        for (const file of acceptedFiles) {
            const validation = validateFile(file, {
                maxSize: maxSize * 1024 * 1024,
                allowedTypes,
            });

            if (!validation.valid) {
                toast.error(`${file.name}: ${validation.error}`);
                continue;
            }

            // Generate preview for images
            if (isImage(file)) {
                const preview = await generatePreview(file);
                (file as FileWithPreview).preview = preview;
            }

            validFiles.push(file as FileWithPreview);
        }

        if (validFiles.length === 0) return;

        setFiles(validFiles);

        // Auto-upload first file
        if (validFiles.length > 0) {
            handleUpload(validFiles[0]);
        }
    }, [maxSize, allowedTypes]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple,
        accept,
    });

    const handleUpload = async (file: File) => {
        setUploadState('uploading');
        setUploadProgress(0);

        try {
            const result = await uploadFile(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                onProgress: setUploadProgress,
            });

            setUploadState('success');
            setUploadedUrl(result.url);
            onUploadComplete?.(result.url, file);
            toast.success('File uploaded successfully!');
        } catch (error) {
            setUploadState('error');
            onUploadError?.(error as Error);
            toast.error('Upload failed. Please try again.');
        }
    };

    const removeFile = () => {
        setFiles([]);
        setUploadState('idle');
        setUploadProgress(0);
        setUploadedUrl('');
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Dropzone */}
            {uploadState === 'idle' && files.length === 0 && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    {isDragActive ? (
                        <p className="text-primary-600 dark:text-primary-400 font-medium">
                            Drop the file here...
                        </p>
                    ) : (
                        <>
                            <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                                Drag & drop a file here, or click to select
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Max size: {maxSize}MB
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* File Preview */}
            {files.length > 0 && (
                <div className="space-y-4">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800"
                        >
                            <div className="flex items-start gap-4">
                                {/* Preview */}
                                {file.preview ? (
                                    <img
                                        src={file.preview}
                                        alt={file.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <File className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatFileSize(file.size)}
                                    </p>

                                    {/* Progress */}
                                    {uploadState === 'uploading' && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Uploading...
                                                </span>
                                                <span className="text-primary-600 dark:text-primary-400 font-medium">
                                                    {uploadProgress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Success */}
                                    {uploadState === 'success' && (
                                        <div className="mt-2 flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Uploaded successfully</span>
                                        </div>
                                    )}

                                    {/* Error */}
                                    {uploadState === 'error' && (
                                        <div className="mt-2 flex items-center gap-1 text-red-600 dark:text-red-400 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Upload failed</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {uploadState === 'uploading' && (
                                        <Loader className="w-5 h-5 text-primary-600 animate-spin" />
                                    )}
                                    {uploadState === 'success' && (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    )}
                                    {uploadState === 'error' && (
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <button
                                        onClick={removeFile}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Uploaded URL (for debugging) */}
            {uploadedUrl && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-400 font-mono break-all">
                        {uploadedUrl}
                    </p>
                </div>
            )}
        </div>
    );
};
