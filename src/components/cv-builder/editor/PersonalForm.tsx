import React, { useState, useRef } from 'react';
import { useCVStore } from '../../../stores/useCVStore';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, Camera, Trash2 } from 'lucide-react';
import { ImageCropper } from './ImageCropper';

export const PersonalForm: React.FC = () => {
    const { personalInfo, setPersonalInfo } = useCVStore();
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof typeof personalInfo, value: string) => {
        setPersonalInfo({ [field]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setTempImage(reader.result?.toString() || null);
                setIsCropperOpen(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImage: string) => {
        setPersonalInfo({ avatar: croppedImage });
        setTempImage(null);
    };

    const handleRemovePhoto = () => {
        if (window.confirm("Supprimer la photo ?")) {
            setPersonalInfo({ avatar: undefined });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center border-2 border-white dark:border-gray-600 shadow-sm">
                        {personalInfo.avatar ? (
                            <img src={personalInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full shadow-md hover:bg-primary-700 transition-colors"
                        title="Modifier la photo"
                    >
                        <Camera className="w-3 h-3" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Photo de profil</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                        Ajoutez une photo professionnelle (JPG, PNG). Vous pourrez la recadrer.
                    </p>
                    {personalInfo.avatar && (
                        <button
                            onClick={handleRemovePhoto}
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" />
                            Supprimer la photo
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom complet
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={personalInfo.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            className="pl-10 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Titre / Poste
                    </label>
                    <input
                        type="text"
                        value={personalInfo.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                        placeholder="Développeur Fullstack"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="pl-10 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Téléphone
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="tel"
                            value={personalInfo.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="pl-10 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Adresse
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={personalInfo.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="pl-10 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Site Web
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={personalInfo.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                            className="pl-10 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        LinkedIn
                    </label>
                    <div className="relative">
                        <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={personalInfo.linkedin}
                            onChange={(e) => handleChange('linkedin', e.target.value)}
                            className="pl-10 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                            placeholder="linkedin.com/in/..."
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        GitHub
                    </label>
                    <div className="relative">
                        <Github className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={personalInfo.github}
                            onChange={(e) => handleChange('github', e.target.value)}
                            className="pl-10 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                            placeholder="github.com/..."
                        />
                    </div>
                </div>
            </div>

            <ImageCropper
                open={isCropperOpen}
                imageSrc={tempImage}
                onClose={() => setIsCropperOpen(false)}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};
