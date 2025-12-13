import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit2, Trash2, Download, AlertCircle } from 'lucide-react';
import { cvApi, CVData } from '../../api/cv';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const CVManagerWidget: React.FC = () => {
    const navigate = useNavigate();
    const [cvs, setCvs] = useState<CVData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCvs = async () => {
        try {
            const data = await cvApi.getAll();
            setCvs(data);
        } catch (error) {
            console.error("Failed to load CVs", error);
            // Silent fail or toast? Silent for widget usually better unless critical
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCvs();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Supprimer ce CV ? Cette action est irréversible.")) {
            try {
                await cvApi.delete(id);
                toast.success("CV supprimé");
                loadCvs();
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const handleCreateNew = () => {
        navigate('/cv-builder');
        // The builder will reset on mount if no ID is passed, but we might want to force reset?
        // Our builder logic checks URL param. No param = new.
    };

    const handleEdit = (id: string) => {
        navigate(`/cv-builder?id=${id}`);
    };

    if (isLoading) {
        return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Mes CVs
                </h3>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau
                </button>
            </div>

            {cvs.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Aucun CV créé pour le moment</p>
                    <button
                        onClick={handleCreateNew}
                        className="text-primary-600 font-medium text-sm hover:underline"
                    >
                        Créer mon premier CV
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cvs.map((cv) => (
                        <div
                            key={cv._id}
                            onClick={() => handleEdit(cv._id!)}
                            className="group relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer bg-white dark:bg-gray-800"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-lg text-primary-600 dark:text-primary-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => handleDelete(cv._id!, e)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h4 className="font-bold text-gray-900 dark:text-white truncate pr-2">{cv.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                    {cv.templateId?.split('_')[0] || 'Unknown'}
                                </span>
                                <span>•</span>
                                <span>{cv.updatedAt ? format(new Date(cv.updatedAt), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</span>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 h-1 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-lg"></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
