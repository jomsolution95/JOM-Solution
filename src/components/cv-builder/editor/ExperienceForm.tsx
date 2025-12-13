import React from 'react';
import { useCVStore, Experience } from '../../../stores/useCVStore';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const ExperienceForm: React.FC = () => {
    const { experiences, addExperience, updateExperience, removeExperience } = useCVStore();

    const handleAdd = () => {
        addExperience({
            id: generateId(),
            position: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
        });
    };

    return (
        <div className="space-y-6">
            {experiences.map((exp, index) => (
                <div key={exp.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 relative group">
                    <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Poste</label>
                            <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                placeholder="Ex: Chef de projet"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Entreprise</label>
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                placeholder="Ex: JOM Solution"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date de début</label>
                            <input
                                type="text" // Using text for simplicity, could be date
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                placeholder="MM/AAAA"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date de fin</label>
                            <input
                                type="text"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                                disabled={exp.current}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm disabled:opacity-50"
                                placeholder={exp.current ? "Présent" : "MM/AAAA"}
                            />
                            <div className="mt-2 flex items-center">
                                <input
                                    type="checkbox"
                                    id={`current-${exp.id}`}
                                    checked={exp.current}
                                    onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: '' })}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor={`current-${exp.id}`} className="ml-2 text-xs text-gray-600 dark:text-gray-400">Poste actuel</label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Description</label>
                        <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                            placeholder="Décrivez vos missions et réalisations..."
                        />
                    </div>
                </div>
            ))}

            <button
                onClick={handleAdd}
                className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors bg-gray-50 dark:bg-gray-800/50"
            >
                <Plus className="w-4 h-4" />
                Ajouter une expérience
            </button>
        </div>
    );
};
