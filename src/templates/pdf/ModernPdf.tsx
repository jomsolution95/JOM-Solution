import React from 'react';
import { Page, Text, View, Document } from '@react-pdf/renderer';
import { TemplateProps } from '../cv/types';
import { createPdfStyles } from './styles';

export const ModernPdf: React.FC<TemplateProps> = ({ data, config }) => {
    const styles = createPdfStyles(config);
    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.h1}>{personalInfo.fullName}</Text>
                    <Text style={styles.h2}>{personalInfo.title}</Text>

                    <View style={styles.contactLine}>
                        {personalInfo.email && <Text>{personalInfo.email}</Text>}
                        {personalInfo.phone && <Text>• {personalInfo.phone}</Text>}
                        {personalInfo.address && <Text>• {personalInfo.address}</Text>}
                        {personalInfo.linkedin && <Text>• {personalInfo.linkedin}</Text>}
                    </View>
                </View>

                <View style={styles.cols2}>
                    {/* Main Column */}
                    <View style={styles.leftCol}>
                        {summary && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Profil</Text>
                                <Text>{summary}</Text>
                            </View>
                        )}

                        {experiences.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>
                                {experiences.map((exp) => (
                                    <View key={exp.id} style={{ marginBottom: 10 }}>
                                        <View style={styles.row}>
                                            <Text style={[styles.bold, { color: config.colors.secondary }]}>{exp.position}</Text>
                                            <Text style={[styles.textSmall, styles.textMuted]}>
                                                {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                                            </Text>
                                        </View>
                                        <Text style={[styles.textSmall, { color: config.colors.primary, marginBottom: 2 }]}>{exp.company}, {exp.location}</Text>
                                        <Text>{exp.description}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Sidebar Column */}
                    <View style={styles.rightCol}>
                        {education.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Formation</Text>
                                {education.map((edu) => (
                                    <View key={edu.id} style={{ marginBottom: 8 }}>
                                        <Text style={[styles.bold, styles.textSmall, { color: config.colors.secondary }]}>{edu.degree}</Text>
                                        <Text style={styles.textSmall}>{edu.school}</Text>
                                        <Text style={[styles.textSmall, styles.textMuted]}>{edu.endDate}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {skills.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Compétences</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                                    {skills.map((skill) => (
                                        <View
                                            key={skill.id}
                                            style={{
                                                backgroundColor: config.colors.accent,
                                                paddingHorizontal: 6,
                                                paddingVertical: 2,
                                                borderRadius: 4
                                            }}
                                        >
                                            <Text style={[styles.textSmall, { color: config.colors.text }]}>{skill.name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
};
