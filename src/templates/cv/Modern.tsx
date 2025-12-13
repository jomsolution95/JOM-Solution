import React from 'react';
import { TemplateProps } from './types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

export const Modern: React.FC<TemplateProps> = ({ data, config }) => {
    const { colors, fonts } = config;
    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <div
            className="w-full min-h-[1100px] p-8 shadow-xl print:shadow-none"
            style={{ backgroundColor: colors.background, color: colors.text, fontFamily: fonts.body }}
        >
            {/* Header */}
            <header className="border-b-2 pb-6 mb-8" style={{ borderColor: colors.primary }}>
                <h1
                    className="text-4xl font-bold uppercase tracking-tight mb-2"
                    style={{ color: colors.secondary, fontFamily: fonts.headings }}
                >
                    {personalInfo.fullName}
                </h1>
                <h2
                    className="text-xl font-medium uppercase tracking-widest mb-4"
                    style={{ color: colors.primary }}
                >
                    {personalInfo.title}
                </h2>

                <div className="flex flex-wrap gap-4 text-sm" style={{ color: colors.subtext }}>
                    {personalInfo.email && <div className="flex items-center gap-1.5"><Mail size={14} />{personalInfo.email}</div>}
                    {personalInfo.phone && <div className="flex items-center gap-1.5"><Phone size={14} />{personalInfo.phone}</div>}
                    {personalInfo.address && <div className="flex items-center gap-1.5"><MapPin size={14} />{personalInfo.address}</div>}
                    {personalInfo.linkedin && <div className="flex items-center gap-1.5"><Linkedin size={14} />{personalInfo.linkedin}</div>}
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Column */}
                <div className="col-span-8 space-y-8">
                    {/* Render Main Column Sections dynamically */}
                    {/* For now, we simply render 'summary' and 'experiences' in main, others in sidebar, 
                        BUT respecting visibility. 
                        Ideally, we should split sectionOrder into 'main' and 'sidebar' arrays if we want full DnD control over placement.
                        Current request implies simple reordering. Let's filter sectionOrder for Main types. 
                     */}

                    {!config.layout?.hiddenSections?.includes('summary') && summary && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: colors.primary, borderColor: colors.accent }}>
                                Profil
                            </h3>
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                                {summary}
                            </p>
                        </section>
                    )}

                    {!config.layout?.hiddenSections?.includes('experiences') && experiences.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ color: colors.primary, borderColor: colors.accent }}>
                                Expérience Professionnelle
                            </h3>
                            <div className="space-y-6">
                                {experiences.map((exp) => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold" style={{ color: colors.secondary }}>{exp.position}</h4>
                                            <span className="text-xs font-medium" style={{ color: colors.subtext }}>
                                                {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium" style={{ color: colors.primary }}>{exp.company}</span>
                                            <span className="text-xs opacity-75">{exp.location}</span>
                                        </div>
                                        <p className="text-sm opacity-90 whitespace-pre-line">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="col-span-4 space-y-8">
                    {!config.layout?.hiddenSections?.includes('education') && education.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ color: colors.primary, borderColor: colors.accent }}>
                                Formation
                            </h3>
                            <div className="space-y-4">
                                {education.map((edu) => (
                                    <div key={edu.id}>
                                        <h4 className="font-bold text-sm" style={{ color: colors.secondary }}>{edu.degree}</h4>
                                        <div className="text-sm opacity-90">{edu.school}</div>
                                        <div className="text-xs italic mt-1" style={{ color: colors.subtext }}>
                                            {edu.startDate && `${edu.startDate} - `}{edu.endDate}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {!config.layout?.hiddenSections?.includes('skills') && skills.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ color: colors.primary, borderColor: colors.accent }}>
                                Compétences
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                    <span
                                        key={skill.id}
                                        className="px-2 py-1 text-xs font-medium rounded"
                                        style={{ backgroundColor: colors.accent, color: colors.text }}
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
