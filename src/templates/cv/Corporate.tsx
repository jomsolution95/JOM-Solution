import React from 'react';
import { TemplateProps } from './types';

export const Corporate: React.FC<TemplateProps> = ({ data, config }) => {
    const { colors, fonts } = config;
    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <div
            className="w-full min-h-[1100px] shadow-xl print:shadow-none bg-white flex"
            style={{ fontFamily: fonts.body }}
        >
            {/* Sidebar Left (Corporate often has a strong sidebar) */}
            <aside
                className="w-1/3 p-8 flex flex-col gap-8 text-white"
                style={{ backgroundColor: colors.primary }}
            >
                <div className="text-center">
                    {/* Placeholder for Photo if we had one */}
                    <div className="w-32 h-32 mx-auto rounded-full bg-white/20 mb-4 flex items-center justify-center text-2xl font-bold">
                        {personalInfo.fullName.charAt(0)}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/20 pb-2">Contact</h3>
                    <div className="text-sm space-y-2 opacity-90">
                        {personalInfo.email && <div className="break-words">{personalInfo.email}</div>}
                        {personalInfo.phone && <div>{personalInfo.phone}</div>}
                        {personalInfo.address && <div>{personalInfo.address}</div>}
                        {personalInfo.linkedin && <div className="break-words text-xs">{personalInfo.linkedin}</div>}
                    </div>
                </div>

                {education.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/20 pb-2">Formation</h3>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id} className="text-sm">
                                    <div className="font-bold">{edu.degree}</div>
                                    <div className="opacity-80">{edu.school}</div>
                                    <div className="text-xs opacity-60">{edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {skills.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/20 pb-2">Expertise</h3>
                        <ul className="text-sm space-y-1">
                            {skills.map((skill) => (
                                <li key={skill.id} className="opacity-90">• {skill.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="w-2/3 p-10 bg-white">
                <header className="mb-10 border-b-4 pb-6" style={{ borderColor: colors.secondary }}>
                    <h1
                        className="text-4xl font-extrabold uppercase mb-2"
                        style={{ color: colors.secondary, fontFamily: fonts.headings }}
                    >
                        {personalInfo.fullName}
                    </h1>
                    <h2 className="text-xl font-medium" style={{ color: colors.subtext }}>
                        {personalInfo.title}
                    </h2>
                </header>

                <div className="space-y-10">
                    {summary && (
                        <section>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-3" style={{ color: colors.secondary }}>
                                <span className="w-2 h-8 block" style={{ backgroundColor: colors.secondary }}></span>
                                A Propos
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm text-justify">
                                {summary}
                            </p>
                        </section>
                    )}

                    {experiences.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-3" style={{ color: colors.secondary }}>
                                <span className="w-2 h-8 block" style={{ backgroundColor: colors.secondary }}></span>
                                Expérience
                            </h3>
                            <div className="space-y-8">
                                {experiences.map((exp) => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-lg" style={{ color: colors.text }}>{exp.position}</h4>
                                            <span className="text-sm font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                                                {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                                            </span>
                                        </div>
                                        <div className="text-md font-medium mb-2" style={{ color: colors.primary }}>{exp.company}</div>
                                        <p className="text-gray-600 text-sm leading-6">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};
