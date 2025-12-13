import React from 'react';
import { TemplateProps } from './types';

export const ATS: React.FC<TemplateProps> = ({ data, config }) => {
    const { colors, fonts } = config;
    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <div
            className="w-full min-h-[1100px] p-10 bg-white"
            style={{ color: '#000000', fontFamily: 'Arial, sans-serif' }}
        >
            {/* ATS Header - Centered, Plain Text */}
            <div className="text-center border-b border-black pb-4 mb-4">
                <h1 className="text-2xl font-bold uppercase mb-1">{personalInfo.fullName}</h1>
                <p className="text-sm mb-2">{personalInfo.location} | {personalInfo.email} | {personalInfo.phone}</p>
                {personalInfo.linkedin && <p className="text-sm">{personalInfo.linkedin}</p>}
            </div>

            {/* Resume Body */}
            <div className="space-y-6">

                {/* Summary */}
                {summary && (
                    <section>
                        <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Professional Summary</h3>
                        <p className="text-sm text-justify">{summary}</p>
                    </section>
                )}

                {/* Experience */}
                {experiences.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Work Experience</h3>
                        <div className="space-y-4">
                            {experiences.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>{exp.position}</span>
                                        <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                                    </div>
                                    <div className="italic text-sm mb-1">{exp.company}, {exp.location}</div>
                                    <ul className="list-disc list-outside ml-4 text-sm">
                                        {/* Simple split by newline for bullet points simulation if description is text block */}
                                        {exp.description.split('\n').map((line, i) => (
                                            line.trim() && <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Education</h3>
                        <div className="space-y-2">
                            {education.map((edu) => (
                                <div key={edu.id} className="text-sm">
                                    <div className="flex justify-between font-bold">
                                        <span>{edu.school}</span>
                                        <span>{edu.endDate}</span>
                                    </div>
                                    <div>{edu.degree}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Skills</h3>
                        <p className="text-sm">
                            {skills.map(skill => skill.name).join(', ')}
                        </p>
                    </section>
                )}

            </div>
        </div>
    );
};
