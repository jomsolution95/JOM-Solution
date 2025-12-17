import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, FileText, Save, Loader, Linkedin, Github, Twitter, Globe, Plus, Trash2, Pencil, Calendar, Building2, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarUploader } from '../components/AvatarUploader';
import { toast } from 'react-toastify';
import api from '../api/client';
import { v4 as uuidv4 } from 'uuid';

// Types (Mirrors backend schema/frontend types)
interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
}

interface Education {
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
}

export const ProfileSettings: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [profileId, setProfileId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '', // User field
        email: '', // User field
        phone: '', // User/Profile field
        bio: '', // Profile field
        avatar: '', // Profile/User field
        location: '', // Profile field
        socialLinks: { facebook: '', linkedin: '', github: '', twitter: '', website: '' },
        experience: [] as Experience[],
        education: [] as Education[],
        skills: [] as string[]
    });

    const [skillInput, setSkillInput] = useState('');
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [showExpModal, setShowExpModal] = useState(false);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [showEduModal, setShowEduModal] = useState(false);

    // Initial Data Load
    useEffect(() => {
        const loadProfileData = async () => {
            if (!user?.id) return;
            try {
                // Fetch Profile (Professional Data)
                const profileRes = await api.get(`/profiles/user/${user.id}`);
                const profile = profileRes.data;
                const userData = profile.user || {};

                setProfileId(profile._id);

                setFormData({
                    name: profile.displayName || userData.name || '',
                    email: userData.email || '',
                    phone: profile.phone || userData.phone || '',
                    bio: profile.bio || '',
                    avatar: profile.avatarUrl || userData.avatar || '',
                    location: profile.location || '',
                    socialLinks: { ...userData.socialLinks, ...profile.socialLinks },
                    experience: profile.experience || [],
                    education: profile.education || [],
                    skills: profile.skills || []
                });
            } catch (error) {
                console.error("Error loading profile:", error);
                // Fallback to basic user data if profile fetch fails (e.g. 404)
                setFormData(prev => ({
                    ...prev,
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    avatar: user.avatar || '',
                    socialLinks: user.socialLinks || prev.socialLinks
                }));
            } finally {
                setIsFetching(false);
            }
        };

        loadProfileData();
    }, [user]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            socialLinks: { ...formData.socialLinks, [e.target.name]: e.target.value }
        });
    };

    const handleAvatarUpload = (url: string) => {
        setFormData({ ...formData, avatar: url });
    };

    // --- SKILLS ---
    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            }
            setSkillInput('');
        }
    };
    const removeSkill = (skill: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    };

    // --- EXPERIENCE ---
    const saveExperience = (exp: Experience) => {
        let newExpList = [...formData.experience];
        const index = newExpList.findIndex(e => e.id === exp.id);
        if (index >= 0) {
            newExpList[index] = exp;
        } else {
            newExpList.push({ ...exp, id: uuidv4() }); // Ensure ID
        }
        setFormData({ ...formData, experience: newExpList });
        setShowExpModal(false);
        setEditingExperience(null);
    };
    const deleteExperience = (id: string) => {
        setFormData({ ...formData, experience: formData.experience.filter(e => e.id !== id) });
    };

    // --- EDUCATION ---
    const saveEducation = (edu: Education) => {
        let newEduList = [...formData.education];
        const index = newEduList.findIndex(e => e.id === edu.id);
        if (index >= 0) {
            newEduList[index] = edu;
        } else {
            newEduList.push({ ...edu, id: uuidv4() });
        }
        setFormData({ ...formData, education: newEduList });
        setShowEduModal(false);
        setEditingEducation(null);
    };
    const deleteEducation = (id: string) => {
        setFormData({ ...formData, education: formData.education.filter(e => e.id !== id) });
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Update Profile (if profileId exists, otherwise we assume users should have one created on registration)
            if (profileId) {
                // Map frontend data to backend DTO structure
                const payload = {
                    firstName: formData.name.split(' ')[0], // Simple split, ideal would be separate fields
                    lastName: formData.name.split(' ').slice(1).join(' '),
                    displayName: formData.name,
                    phone: formData.phone,
                    bio: formData.bio,
                    location: formData.location,
                    avatarUrl: formData.avatar,
                    socialLinks: formData.socialLinks,
                    experience: formData.experience,
                    education: formData.education,
                    skills: formData.skills
                };

                const response = await api.patch(`/profiles/${profileId}`, payload);

                // Also update local User context if needed
                updateUser({
                    ...user,
                    name: formData.name,
                    avatar: formData.avatar,
                    bio: formData.bio
                });

                toast.success('Profil mis à jour avec succès !');
            } else {
                toast.error("Profil introuvable. Veuillez contacter le support.");
            }
        } catch (error: any) {
            console.error("Update error", error);
            toast.error(error.response?.data?.message || 'Échec de la mise à jour du profil');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="p-8 text-center"><Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" /></div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Paramètres du Profil</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Basic Info */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">Informations Générales</h3>
                    {/* Avatar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Photo de Profil</label>
                        <AvatarUploader currentAvatar={formData.avatar} onUploadComplete={handleAvatarUpload} size="lg" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><User className="w-4 h-4 inline mr-2" />Nom Complet</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Mail className="w-4 h-4 inline mr-2" />Email (Non modifiable)</label>
                            <input type="email" value={formData.email} disabled className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Phone className="w-4 h-4 inline mr-2" />Téléphone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Globe className="w-4 h-4 inline mr-2" />Localisation</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="ex: Dakar, Sénégal" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><FileText className="w-4 h-4 inline mr-2" />Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} maxLength={500} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none" />
                    </div>
                </div>

                {/* 2. Skills */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">Compétences</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.skills.map(skill => (
                            <span key={skill} className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Ajouter une compétence et appuyez sur Entrée (ex: React, Python...)"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                {/* 3. Experience */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Expérience Professionnelle</h3>
                        <button type="button" onClick={() => { setEditingExperience({ id: '', title: '', company: '', location: '', startDate: '', current: false, description: '' }); setShowExpModal(true); }} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Ajouter</button>
                    </div>
                    {formData.experience.length === 0 && <p className="text-gray-500 text-sm italic">Aucune expérience ajoutée.</p>}
                    <div className="space-y-3">
                        {formData.experience.map(exp => (
                            <div key={exp.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{exp.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company} • {exp.location}</p>
                                    <p className="text-xs text-gray-500">{new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Présent' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : '')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => { setEditingExperience(exp); setShowExpModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                                    <button type="button" onClick={() => deleteExperience(exp.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Education */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Formation</h3>
                        <button type="button" onClick={() => { setEditingEducation({ id: '', school: '', degree: '', field: '', startDate: '', endDate: '' }); setShowEduModal(true); }} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Ajouter</button>
                    </div>
                    {formData.education.length === 0 && <p className="text-gray-500 text-sm italic">Aucune formation ajoutée.</p>}
                    <div className="space-y-3">
                        {formData.education.map(edu => (
                            <div key={edu.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{edu.school}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{edu.degree} • {edu.field}</p>
                                    <p className="text-xs text-gray-500">{new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => { setEditingEducation(edu); setShowEduModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                                    <button type="button" onClick={() => deleteEducation(edu.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Social Links (Existing) */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Réseaux Sociaux</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm mb-1">LinkedIn</label><input type="url" name="linkedin" value={formData.socialLinks.linkedin} onChange={handleSocialChange} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700" placeholder="https://linkedin.com/in/..." /></div>
                        <div><label className="block text-sm mb-1">Github</label><input type="url" name="github" value={formData.socialLinks.github} onChange={handleSocialChange} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700" placeholder="https://github.com/..." /></div>
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors">
                    {isLoading ? <><Loader className="w-5 h-5 animate-spin" /> Enregistrement...</> : <><Save className="w-5 h-5" /> Enregistrer les modifications</>}
                </button>
            </form>

            {/* Modals */}
            {showExpModal && editingExperience && (
                <ExperienceModal
                    experience={editingExperience}
                    onSave={saveExperience}
                    onClose={() => setShowExpModal(false)}
                />
            )}
            {showEduModal && editingEducation && (
                <EducationModal
                    education={editingEducation}
                    onSave={saveEducation}
                    onClose={() => setShowEduModal(false)}
                />
            )}
        </div>
    );
};

// --- Mini Components for Modals ---
const ExperienceModal = ({ experience, onSave, onClose }: { experience: Experience, onSave: (e: Experience) => void, onClose: () => void }) => {
    const [data, setData] = useState(experience);
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
                <h3 className="text-xl font-bold dark:text-white">{experience.id ? 'Modifier' : 'Ajouter'} Expérience</h3>
                <input type="text" placeholder="Titre du poste" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
                <input type="text" placeholder="Entreprise" value={data.company} onChange={e => setData({ ...data, company: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
                <input type="text" placeholder="Lieu" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
                <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs">Début</label><input type="date" value={data.startDate ? data.startDate.split('T')[0] : ''} onChange={e => setData({ ...data, startDate: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" /></div>
                    <div><label className="text-xs">Fin</label><input type="date" disabled={data.current} value={data.endDate ? data.endDate.split('T')[0] : ''} onChange={e => setData({ ...data, endDate: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" /></div>
                </div>
                <div className="flex items-center gap-2"><input type="checkbox" checked={data.current} onChange={e => setData({ ...data, current: e.target.checked })} /><label className="text-sm dark:text-gray-300">Toujours en poste</label></div>
                <textarea placeholder="Description" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" rows={3}></textarea>
                <div className="flex gap-2 justify-end pt-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">Annuler</button>
                    <button onClick={() => onSave(data)} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Sauvegarder</button>
                </div>
            </div>
        </div>
    );
};

const EducationModal = ({ education, onSave, onClose }: { education: Education, onSave: (e: Education) => void, onClose: () => void }) => {
    const [data, setData] = useState(education);
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
                <h3 className="text-xl font-bold dark:text-white">{education.id ? 'Modifier' : 'Ajouter'} Formation</h3>
                <input type="text" placeholder="École Info..." value={data.school} onChange={e => setData({ ...data, school: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
                <input type="text" placeholder="Diplôme (ex: Master)" value={data.degree} onChange={e => setData({ ...data, degree: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
                <input type="text" placeholder="Domaine d'études" value={data.field} onChange={e => setData({ ...data, field: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" />
                <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs">Début (Année)</label><input type="number" placeholder="2018" value={new Date(data.startDate).getFullYear() || ''} onChange={e => setData({ ...data, startDate: new Date(e.target.value, 0, 1).toISOString() })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" /></div>
                    <div><label className="text-xs">Fin (Année)</label><input type="number" placeholder="2022" value={new Date(data.endDate).getFullYear() || ''} onChange={e => setData({ ...data, endDate: new Date(e.target.value, 0, 1).toISOString() })} className="w-full px-3 py-2 border rounded dark:bg-gray-700" /></div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">Annuler</button>
                    <button onClick={() => onSave(data)} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Sauvegarder</button>
                </div>
            </div>
        </div>
    );
};
