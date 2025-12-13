import React from 'react';
import { TemplateProps } from './types';

export const Creative: React.FC<TemplateProps> = ({ data, config }) => {
    const { colors, fonts } = config;
    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <div
            className="w-full min-h-[1100px] shadow-xl print:shadow-none bg-white relative overflow-hidden"
            style={{ fontFamily: fonts.body }}
        >
            {/* Artistic Header Background */}
            <div
                className="absolute top-0 left-0 w-full h-64 z-0"
                style={{ backgroundColor: colors.primary }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="relative z-10 p-8 grid grid-cols-12 gap-8 h-full">

                {/* Header Card */}
                <header className="col-span-12 bg-white rounded-xl shadow-lg p-8 mt-16 flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-black mb-2 tracking-tighter" style={{ color: colors.primary, fontFamily: fonts.headings }}>
                            {personalInfo.fullName.split(' ')[0]}
                            <span style={{ color: colors.secondary }}>{personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">
                            {personalInfo.title}
                        </h2>
                    </div>
                </header>

                {/* Left Col */}
                <div className="col-span-4 space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl border-l-4" style={{ borderColor: colors.secondary }}>
                        <h3 className="font-bold mb-4 uppercase text-sm opacity-50">Contact</h3>
                        <div className="space-y-2 text-sm font-medium" style={{ color: colors.primary }}>
                            <div>{personalInfo.email}</div>
                            <div>{personalInfo.phone}</div>
                            <div>{personalInfo.address}</div>
                            <div>{personalInfo.linkedin}</div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border-l-4" style={{ borderColor: colors.secondary }}>
                        <h3 className="font-bold mb-4 uppercase text-sm opacity-50">Compétences</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map(skill => (
                                <span
                                    key={skill.id}
                                    className="px-3 py-1 rounded-full text-xs font-bold text-white transition-transform hover:scale-105"
                                    style={{ backgroundColor: colors.accent }}
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {education.length > 0 && (
                        <div className="bg-gray-50 p-6 rounded-xl border-l-4" style={{ borderColor: colors.secondary }}>
                            <h3 className="font-bold mb-4 uppercase text-sm opacity-50">Education</h3>
                            {education.map(edu => (
                                <div key={edu.id} className="mb-4 last:mb-0">
                                    <div className="font-bold text-sm">{edu.degree}</div>
                                    <div className="text-xs text-gray-500">{edu.school}</div>
                                    <div className="text-xs text-gray-400">{edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Col */}
                <div className="col-span-8 space-y-8">
                    {summary && (
                        <section>
                            <p className="text-lg leading-relaxed font-light text-gray-600">
                                {summary}
                            </p>
                        </section>
                    )}

                    {experiences.length > 0 && (
                        <section>
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-2" style={{ color: colors.primary }}>
                                <span className="text-4xl opacity-20">01</span>
                                EXPERIENCE
                            </h3>
                            <div className="space-y-8 border-l-2 pl-8 ml-2" style={{ borderColor: colors.background }}>
                                {experiences.map(exp => (
                                    <div key={exp.id} className="relative">
                                        <div
                                            className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white"
                                            style={{ backgroundColor: colors.secondary }}
                                        ></div>
                                        <h4 className="text-xl font-bold" style={{ color: colors.text }}>{exp.position}</h4>
                                        <div className="text-sm font-bold uppercase mb-2" style={{ color: colors.accent }}>
                                            {exp.company} | {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
