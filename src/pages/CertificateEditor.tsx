
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Save, Upload, Type, Move, Image as ImageIcon, Layout, Eye } from 'lucide-react';

interface ElementPosition {
    x: number;
    y: number;
    fontSize: number;
    visible: boolean;
    color?: string;
    label: string;
}

interface TemplateState {
    _id?: string;
    name: string;
    backgroundImageUrl: string;
    textColor: string;
    layout: {
        studentName: ElementPosition;
        courseName: ElementPosition;
        date: ElementPosition;
        signature: ElementPosition & { customText?: string };
    };
}

const DEFAULT_LAYOUT = {
    studentName: { x: 50, y: 40, fontSize: 32, visible: true, label: "Nom de l'étudiant" },
    courseName: { x: 50, y: 55, fontSize: 24, visible: true, label: "Titre du Cours" },
    date: { x: 20, y: 80, fontSize: 16, visible: true, label: "Date" },
    signature: { x: 80, y: 80, fontSize: 18, visible: true, label: "Signature", customText: "Le Directeur" },
};

export const CertificateEditor: React.FC = () => {
    const { user } = useAuth();
    const [template, setTemplate] = useState<TemplateState>({
        name: 'Mon Diplôme',
        backgroundImageUrl: '',
        textColor: '#000000',
        layout: JSON.parse(JSON.stringify(DEFAULT_LAYOUT)) // Deep copy
    });

    const [loading, setLoading] = useState(false);
    const [draggedItem, setDraggedItem] = useState<keyof typeof DEFAULT_LAYOUT | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadTemplate();
    }, []);

    const loadTemplate = async () => {
        try {
            const res = await api.get('/academy/certificates/templates');
            if (res.data && res.data.length > 0) {
                setTemplate(res.data[0]); // Load the first one for simplicity
            }
        } catch (error) {
            console.error("No existing template found or error loading.");
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (template._id) {
                await api.put(`/academy/certificates/templates/${template._id}`, template);
            } else {
                await api.post('/academy/certificates/templates', template);
            }
            toast.success("Modèle sauvegardé avec succès !");
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, item: keyof typeof DEFAULT_LAYOUT) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedItem || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setTemplate(prev => ({
            ...prev,
            layout: {
                ...prev.layout,
                [draggedItem]: { ...prev.layout[draggedItem], x, y }
            }
        }));
        setDraggedItem(null);
    };

    // Upload Background Handler specifically for Cloudinary/Backend
    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading("Téléchargement de l'image...");

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTemplate(prev => ({ ...prev, backgroundImageUrl: res.data.url }));
            toast.update(toastId, { render: "Image chargée !", type: "success", isLoading: false, autoClose: 3000 });
        } catch (err) {
            toast.update(toastId, { render: "Erreur de téléchargement.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };


    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">
                <BackButton />

                <div className="mt-4 mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Layout className="w-8 h-8 text-yellow-500" />
                            Éditeur de Diplôme
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Créez le design de vos certificats. Glissez-déposez les éléments sur la zone de travail.
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                    >
                        <Save className="w-4 h-4" /> {loading ? 'Sauvegarde...' : 'Sauvegarder le modèle'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* EDITOR CANVAS (A4 Ratio Landscape approx 297mm x 210mm ~ 1.414 aspect) */}
                    <div className="lg:col-span-2">
                        <div
                            className="w-full aspect-[1.414/1] bg-white shadow-2xl rounded-lg overflow-hidden relative select-none"
                            style={{
                                backgroundImage: template.backgroundImageUrl ? `url(${template.backgroundImageUrl})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                color: template.textColor
                            }}
                            ref={containerRef}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {!template.backgroundImageUrl && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-300 m-8 rounded-xl">
                                    <div className="text-center">
                                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Aucune image de fond<br />Utilisez le panneau de droite pour en ajouter une.</p>
                                    </div>
                                </div>
                            )}

                            {/* Draggable Elements */}
                            {Object.entries(template.layout).map(([key, config]) => {
                                if (!config.visible) return null;
                                return (
                                    <div
                                        key={key}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, key as any)}
                                        className="absolute cursor-move border border-transparent hover:border-blue-400 hover:bg-blue-50/20 px-2 py-1 rounded transition-colors group"
                                        style={{
                                            left: `${config.x}%`,
                                            top: `${config.y}%`,
                                            fontSize: `${config.fontSize / 20}vw`, // Responsive font size hack
                                            transform: 'translate(-50%, -50%)', // Center anchor
                                            fontWeight: key === 'studentName' ? 'bold' : 'normal',
                                            fontFamily: 'serif'
                                        }}
                                    >
                                        {key === 'studentName' ? 'Prénom Nom' :
                                            key === 'courseName' ? 'Formation Complète React' :
                                                key === 'date' ? new Date().toLocaleDateString() :
                                                    (config as any).customText || 'Signature'}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-center text-gray-500 text-xs mt-4">
                            Astuce: Glissez les éléments pour les positionner.
                        </p>
                    </div>

                    {/* CONTROLS */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-fit space-y-8">

                        {/* Background Config */}
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-purple-500" /> Fond du diplôme
                            </h3>
                            {template.backgroundImageUrl ? (
                                <div className="space-y-3">
                                    <img src={template.backgroundImageUrl} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                                    <button
                                        onClick={() => setTemplate(prev => ({ ...prev, backgroundImageUrl: '' }))}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        Supprimer l'image
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer relative">
                                    <input type="file" onChange={handleBackgroundUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Cliquez pour uploader</p>
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700" />

                        {/* Text Style */}
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Type className="w-5 h-5 text-blue-500" /> Style du texte
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={template.textColor}
                                    onChange={(e) => setTemplate(prev => ({ ...prev, textColor: e.target.value }))}
                                    className="h-10 w-full rounded cursor-pointer"
                                />
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700" />

                        {/* Elements Config */}
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Layout className="w-5 h-5 text-green-500" /> Éléments
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(template.layout).map(([key, config]) => (
                                    <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{(config as any).label}</span>
                                            <button
                                                onClick={() => setTemplate(prev => ({
                                                    ...prev,
                                                    layout: {
                                                        ...prev.layout,
                                                        [key]: { ...config, visible: !config.visible }
                                                    }
                                                }))}
                                                className={`p-1 rounded ${config.visible ? 'text-primary-600 bg-primary-50' : 'text-gray-400'}`}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {config.visible && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] uppercase text-gray-400 font-bold">Taille (px)</label>
                                                    <input
                                                        type="number"
                                                        value={config.fontSize}
                                                        onChange={(e) => setTemplate(prev => ({
                                                            ...prev,
                                                            layout: { ...prev.layout, [key]: { ...config, fontSize: parseInt(e.target.value) } }
                                                        }))}
                                                        className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                                                    />
                                                </div>
                                                {(config as any).customText !== undefined && (
                                                    <div>
                                                        <label className="text-[10px] uppercase text-gray-400 font-bold">Texte</label>
                                                        <input
                                                            type="text"
                                                            value={(config as any).customText}
                                                            onChange={(e) => setTemplate(prev => ({
                                                                ...prev,
                                                                layout: { ...prev.layout, [key]: { ...config, customText: e.target.value } }
                                                            }))}
                                                            className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
