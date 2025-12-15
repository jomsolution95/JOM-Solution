import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, Video, X, Loader, Plus } from 'lucide-react';
import { uploadFiles, generatePreview, isImage, isVideo } from '../utils/upload';
import { toast } from 'react-toastify';

export interface MediaFile {
    file: File;
    preview: string;
    url?: string;
    uploading?: boolean;
    progress?: number;
    error?: boolean;
}

export interface PostMediaUploaderProps {
    onMediaChange?: (urls: string[]) => void;
    maxFiles?: number;
    className?: string;
}

export const PostMediaUploader: React.FC<PostMediaUploaderProps> = ({
    onMediaChange,
    maxFiles = 4,
    className = '',
}) => {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Check max files
        if (mediaFiles.length + acceptedFiles.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} fichiers autorisés`);
            return;
        }

        // Validate and create previews
        const newMediaFiles: MediaFile[] = [];

        for (const file of acceptedFiles) {
            if (!isImage(file) && !isVideo(file)) {
                toast.error(`${file.name} n'est pas une image ou une vidéo`);
                continue;
            }

            const preview = await generatePreview(file);
            newMediaFiles.push({
                file,
                preview,
                uploading: true,
                progress: 0,
            });
        }

        if (newMediaFiles.length === 0) return;

        // Add to state
        setMediaFiles(prev => [...prev, ...newMediaFiles]);

        // Upload files
        uploadMediaFiles(newMediaFiles);
    }, [mediaFiles.length, maxFiles]);

    const uploadMediaFiles = async (files: MediaFile[]) => {
        const uploadPromises = files.map(async (mediaFile, index) => {
            try {
                const result = await uploadFiles([mediaFile.file], {
                    maxSizeMB: 2,
                    maxWidthOrHeight: 1920,
                    onProgress: (progress) => {
                        setMediaFiles(prev =>
                            prev.map(f =>
                                f.file === mediaFile.file
                                    ? { ...f, progress }
                                    : f
                            )
                        );
                    },
                });

                // Update with URL
                setMediaFiles(prev =>
                    prev.map(f =>
                        f.file === mediaFile.file
                            ? { ...f, url: result[0].url, uploading: false }
                            : f
                    )
                );

                return result[0].url;
            } catch (error) {
                setMediaFiles(prev =>
                    prev.map(f =>
                        f.file === mediaFile.file
                            ? { ...f, uploading: false, error: true }
                            : f
                    )
                );
                toast.error(`Échec du téléchargement de ${mediaFile.file.name}`);
                return null;
            }
        });

        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter(url => url !== null) as string[];

        // Notify parent
        const allUrls = mediaFiles
            .filter(f => f.url)
            .map(f => f.url!)
            .concat(validUrls);

        onMediaChange?.(allUrls);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
            'video/*': ['.mp4', '.mov', '.avi'],
        },
        multiple: true,
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const removeMedia = (index: number) => {
        const newMediaFiles = mediaFiles.filter((_, i) => i !== index);
        setMediaFiles(newMediaFiles);

        const urls = newMediaFiles.filter(f => f.url).map(f => f.url!);
        onMediaChange?.(urls);
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Existing Media */}
                {mediaFiles.map((media, index) => (
                    <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group"
                    >
                        {/* Preview */}
                        {isImage(media.file) ? (
                            <img
                                src={media.preview}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                <Video className="w-12 h-12 text-gray-400" />
                            </div>
                        )}

                        {/* Upload Progress */}
                        {media.uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center">
                                <Loader className="w-8 h-8 text-white animate-spin mb-2" />
                                <p className="text-white text-sm font-medium">
                                    {media.progress}%
                                </p>
                            </div>
                        )}

                        {/* Error State */}
                        {media.error && (
                            <div className="absolute inset-0 bg-red-500 bg-opacity-60 flex items-center justify-center">
                                <p className="text-white text-sm font-medium">Échec</p>
                            </div>
                        )}

                        {/* Remove Button */}
                        {!media.uploading && (
                            <button
                                onClick={() => removeMedia(index)}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}

                {/* Add More Button */}
                {mediaFiles.length < maxFiles && (
                    <div
                        {...getRootProps()}
                        className={`aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center ${isDragActive
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                            {isDragActive ? 'Déposez ici' : 'Ajouter un média'}
                        </p>
                    </div>
                )}
            </div>

            {/* Info */}
            {mediaFiles.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {mediaFiles.length} / {maxFiles} fichiers
                </p>
            )}
        </div>
    );
};
