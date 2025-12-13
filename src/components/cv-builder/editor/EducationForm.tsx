import React from 'react';
import { useCVStore } from '../../../stores/useCVStore';
import { Plus, Trash2 } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const EducationForm: React.FC = () => {
    const { education, addEducation, updateEducation, removeEducation } = useCVStore();

    const handleAdd = () => {
        addEducation({
            id: generateId(),
            degree: '',
            school: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
        });
    };

    return (
        <div className="space-y-6">
            {education.map((edu) => (
                <div key={edu.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 relative group">
                    <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Formation / Diplôme</label>
                            <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                placeholder="Ex: Master Informatique"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">École / Université</label>
                            <input
                                type="text"
                                value={edu.school}
                                onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                placeholder="Ex: UCAD"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Début</label>
                            <input
                                type="text"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                placeholder="AAAA"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Fin</label>
                            <input
                                type="text"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                placeholder="AAAA"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Description (Optionnel)</label>
                        <textarea
                            value={edu.description}
                            onChange={(e) => updateEducation(edu.id, { description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                            placeholder="Détails supplémentaires..."
                        />
                    </div>
                </div>
            ))}

            <button
                onClick={handleAdd}
                className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors bg-gray-50 dark:bg-gray-800/50"
            >
                <Plus className="w-4 h-4" />
                Ajouter une formation
            </button>
        </div>
    );
};
