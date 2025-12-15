import React, { useState } from 'react';
import { User, Mail, Phone, FileText, Save, Loader, Linkedin, Github, Twitter, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarUploader } from '../components/AvatarUploader';
import { toast } from 'react-toastify';
import api from '../api/client';

export const ProfileSettings: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        avatar: user?.avatar || '',
        socialLinks: user?.socialLinks || { facebook: '', linkedin: '', github: '', twitter: '', website: '' }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            socialLinks: {
                ...formData.socialLinks,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleAvatarUpload = (url: string) => {
        setFormData({
            ...formData,
            avatar: url,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.patch('/users/profile', formData);
            updateUser(response.data);
            toast.success('Profil mis à jour avec succès !');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Échec de la mise à jour du profil');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Paramètres du Profil</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Photo de Profil
                    </label>
                    <AvatarUploader
                        currentAvatar={formData.avatar}
                        onUploadComplete={handleAvatarUpload}
                        size="lg"
                    />
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Nom Complet
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Adresse Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Vous devrez vérifier votre nouvelle adresse email
                    </p>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Numéro de Téléphone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+221 XX XXX XX XX"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Parlez-nous de vous..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.bio.length}/500 caractères
                    </p>
                </div>

                {/* Social Links */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Réseaux Sociaux</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Linkedin className="w-4 h-4 inline mr-2 text-blue-600" />
                                LinkedIn
                            </label>
                            <input
                                type="url"
                                name="linkedin"
                                value={formData.socialLinks.linkedin || ''}
                                onChange={handleSocialChange}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Github className="w-4 h-4 inline mr-2 text-gray-800 dark:text-white" />
                                GitHub
                            </label>
                            <input
                                type="url"
                                name="github"
                                value={formData.socialLinks.github || ''}
                                onChange={handleSocialChange}
                                placeholder="https://github.com/username"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Twitter className="w-4 h-4 inline mr-2 text-blue-400" />
                                Twitter (X)
                            </label>
                            <input
                                type="url"
                                name="twitter"
                                value={formData.socialLinks.twitter || ''}
                                onChange={handleSocialChange}
                                placeholder="https://twitter.com/username"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Globe className="w-4 h-4 inline mr-2 text-green-600" />
                                Website / Portfolio
                            </label>
                            <input
                                type="url"
                                name="website"
                                value={formData.socialLinks.website || ''}
                                onChange={handleSocialChange}
                                placeholder="https://yourwebsite.com"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                >
                    {isLoading ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Enregistrer les modifications
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
