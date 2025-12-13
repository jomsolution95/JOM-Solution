import React from 'react';
import { TemplateProps } from './types';

export const Minimalist: React.FC<TemplateProps> = ({ data, config }) => {
    const { colors, fonts } = config;
    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <div
            className="w-full min-h-[1100px] p-12 shadow-xl print:shadow-none bg-white"
            style={{ color: colors.text, fontFamily: fonts.body }}
        >
            <div className="max-w-2xl mx-auto">
                <header className="text-center mb-12">
                    <h1
                        className="text-3xl font-light tracking-wide mb-2"
                        style={{ color: colors.secondary, fontFamily: fonts.headings }}
                    >
                        {personalInfo.fullName}
                    </h1>
                    <p className="text-sm uppercase tracking-widest mb-4 opacity-75" style={{ color: colors.primary }}>
                        {personalInfo.title}
                    </p>
                    <div className="text-xs flex justify-center gap-3 opacity-60">
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                        {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
                    </div>
                </header>

                <div className="space-y-10">
                    {summary && (
                        <section>
                            <p className="text-sm leading-7 text-center italic opacity-80">
                                "{summary}"
                            </p>
                        </section>
                    )}

                    {experiences.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-center" style={{ color: colors.primary }}>
                                Expérience
                            </h3>
                            <div className="space-y-8">
                                {experiences.map((exp) => (
                                    <div key={exp.id} className="relative pl-6 border-l" style={{ borderColor: colors.accent }}>
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-2">
                                            <h4 className="font-semibold">{exp.position}</h4>
                                            <span className="text-xs opacity-50 font-mono">
                                                {exp.startDate} — {exp.current ? 'Now' : exp.endDate}
                                            </span>
                                        </div>
                                        <div className="text-sm mb-2 opacity-75">{exp.company}</div>
                                        <p className="text-sm opacity-90 leading-6">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {education.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-center" style={{ color: colors.primary }}>
                                Formation
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {education.map((edu) => (
                                    <div key={edu.id} className="text-center">
                                        <div className="font-medium">{edu.degree}</div>
                                        <div className="text-sm opacity-75">{edu.school}</div>
                                        <div className="text-xs opacity-50 mt-1">{edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {skills.length > 0 && (
                        <section>
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm opacity-80">
                                {skills.map((skill) => (
                                    <span key={skill.id}>{skill.name}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
