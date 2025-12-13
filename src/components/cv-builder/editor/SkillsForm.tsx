import React from 'react';
import { useCVStore } from '../../../stores/useCVStore';
import { X, Plus } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const SkillsForm: React.FC = () => {
    const { skills, addSkill, removeSkill } = useCVStore();
    const [newSkill, setNewSkill] = React.useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSkill.trim()) {
            addSkill({
                id: generateId(),
                name: newSkill.trim(),
                level: 3 // Default
            });
            setNewSkill('');
        }
    };

    return (
        <div>
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                    placeholder="Ajouter une compétence (ex: React, Python)..."
                />
                <button
                    type="submit"
                    disabled={!newSkill.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>

            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <div
                        key={skill.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm border border-gray-200 dark:border-gray-700"
                    >
                        <span>{skill.name}</span>
                        <button
                            onClick={() => removeSkill(skill.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
                {skills.length === 0 && (
                    <p className="text-gray-500 text-sm italic">Aucune compétence ajoutée.</p>
                )}
            </div>
        </div>
    );
};
