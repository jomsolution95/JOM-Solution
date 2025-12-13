import React from 'react';
import { useCVStore } from '../../../stores/useCVStore';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

export const TemplateModern: React.FC = () => {
    const { personalInfo, summary, experiences, education, skills } = useCVStore();

    return (
        <div className="bg-white min-h-[1100px] w-full p-8 text-gray-800 shadow-xl" id="cv-template">
            {/* Header */}
            <div className="border-b-2 border-gray-900 pb-6 mb-6">
                <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-tight mb-2">
                    {personalInfo.fullName || 'Votre Nom'}
                </h1>
                <h2 className="text-xl text-primary-600 font-medium uppercase tracking-widest mb-4">
                    {personalInfo.title || 'Titre du poste'}
                </h2>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {personalInfo.email && (
                        <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {personalInfo.email}
                        </div>
                    )}
                    {personalInfo.phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {personalInfo.phone}
                        </div>
                    )}
                    {personalInfo.address && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {personalInfo.address}
                        </div>
                    )}
                    {personalInfo.linkedin && (
                        <div className="flex items-center gap-1.5">
                            <Linkedin className="w-3.5 h-3.5" />
                            {personalInfo.linkedin}
                        </div>
                    )}
                    {personalInfo.github && (
                        <div className="flex items-center gap-1.5">
                            <Github className="w-3.5 h-3.5" />
                            {personalInfo.github}
                        </div>
                    )}
                    {personalInfo.website && (
                        <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            {personalInfo.website}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="col-span-2 space-y-8">
                    {summary && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
                                Profil
                            </h3>
                            <p className="text-sm leading-relaxed text-gray-600">
                                {summary}
                            </p>
                        </section>
                    )}

                    {experiences.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-1">
                                Expérience Professionnelle
                            </h3>
                            <div className="space-y-6">
                                {experiences.map((exp) => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-900">{exp.position}</h4>
                                            <span className="text-xs font-medium text-gray-500">
                                                {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-primary-600">{exp.company}</span>
                                            <span className="text-xs text-gray-400">{exp.location}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 whitespace-pre-line">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {education.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-1">
                                Formation
                            </h3>
                            <div className="space-y-4">
                                {education.map((edu) => (
                                    <div key={edu.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                                            <span className="text-xs font-medium text-gray-500">
                                                {edu.startDate} - {edu.current ? 'Présent' : edu.endDate}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-700">{edu.school}</span>
                                        </div>
                                        {edu.description && (
                                            <p className="text-sm text-gray-500">
                                                {edu.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {skills.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-1">
                                Compétences
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                    <span key={skill.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages could act similary to skills */}
                </div>
            </div>
        </div>
    );
};
