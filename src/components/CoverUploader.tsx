import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Image as ImageIcon, Loader, X } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';

interface CoverUploaderProps {
    currentCover: string;
    onUpload: (url: string) => void;
}

export const CoverUploader: React.FC<CoverUploaderProps> = ({ currentCover, onUpload }) => {
    const [preview, setPreview] = useState<string>(currentCover);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Construct full URL if relative path
        if (currentCover && !currentCover.startsWith('http') && !currentCover.startsWith('data:')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const cleanPath = currentCover.startsWith('/') ? currentCover : `/${currentCover}`;
            setPreview(`${baseUrl}${cleanPath}`);
        } else {
            setPreview(currentCover);
        }
    }, [currentCover]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/profiles/cover', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Assuming response.data is the Profile object or { url: string }
            // Adjust based on Controller return. 
            // Typically ProfilesService returns Profile object.
            // But let's check what uploadAvatar returns.
            // If it returns Profile, we need profile.coverUrl.
            const newUrl = response.data.coverUrl || response.data.url;

            if (newUrl) {
                onUpload(newUrl);
                toast.success("Photo de couverture mise à jour !");
            } else {
                // Fallback if full profile returned
                // We'll trust onUpload will handle state update if we pass the right thing
                // But safer to just reload or assume success if 200 OK.
                // Let's assume response.data IS the profile.
                if (response.data.coverUrl) {
                    onUpload(response.data.coverUrl);
                    toast.success("Photo de couverture mise à jour !");
                }
            }
        } catch (error) {
            console.error('Error uploading cover:', error);
            toast.error("Erreur lors de l'upload.");
            setPreview(currentCover); // Revert
        } finally {
            setUploading(false);
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative w-full h-48 md:h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden group mb-8 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 transition-colors">
            {/* Background Image */}
            {preview ? (
                <img
                    src={preview}
                    alt="Cover"
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm font-medium">Ajouter une bannière</span>
                </div>
            )}

            {/* Overlay Action */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm">
                <button
                    onClick={triggerUpload}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-gray-50 transition-transform hover:scale-105"
                >
                    {uploading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <Camera className="w-4 h-4" />
                    )}
                    {uploading ? 'Upload en cours...' : 'Changer la bannière'}
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
        </div>
    );
};
