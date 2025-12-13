import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { TemplateProps } from '../cv/types';
import { createPdfStyles } from './styles';

export const MinimalistPdf: React.FC<TemplateProps> = ({ data, config }) => {
    const baseStyles = createPdfStyles(config);
    const { colors, fonts } = config;

    // Custom minimalist overrides
    const styles = StyleSheet.create({
        ...baseStyles,
        header: {
            alignItems: 'center',
            marginBottom: 30,
        },
        h1: {
            fontSize: 28,
            fontFamily: fonts.headings.includes('serif') ? 'Times-Roman' : 'Helvetica', // Simplified font logic
            color: colors.secondary,
            marginBottom: 5,
        },
        subtitle: {
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: colors.primary,
            marginBottom: 10,
        },
        contact: {
            fontSize: 9,
            color: colors.subtext,
            flexDirection: 'row',
            gap: 15,
        },
        quote: {
            fontSize: 10,
            fontStyle: 'italic',
            textAlign: 'center',
            color: colors.text,
            opacity: 0.8,
            marginBottom: 20,
            paddingHorizontal: 40,
        },
        sectionTitle: {
            fontSize: 10,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 2,
            textAlign: 'center',
            color: colors.primary,
            marginBottom: 15,
            marginTop: 10,
        },
        expItem: {
            paddingLeft: 10,
            borderLeftWidth: 1,
            borderLeftColor: colors.accent,
            marginBottom: 15,
        },
        skillRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
        }
    });

    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.h1}>{personalInfo.fullName}</Text>
                    <Text style={styles.subtitle}>{personalInfo.title}</Text>
                    <View style={styles.contact}>
                        {personalInfo.email && <Text>{personalInfo.email}</Text>}
                        {personalInfo.phone && <Text>{personalInfo.phone}</Text>}
                        {personalInfo.linkedin && <Text>LinkedIn</Text>}
                    </View>
                </View>

                {summary && (
                    <Text style={styles.quote}>"{summary}"</Text>
                )}

                {experiences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Expérience</Text>
                        {experiences.map((exp) => (
                            <View key={exp.id} style={styles.expItem}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{exp.position}</Text>
                                    <Text style={{ fontSize: 9, color: colors.subtext }}>{exp.startDate} - {exp.current ? 'Now' : exp.endDate}</Text>
                                </View>
                                <Text style={{ fontSize: 10, marginBottom: 4, color: colors.primary }}>{exp.company}</Text>
                                <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{exp.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Formation</Text>
                        {education.map((edu) => (
                            <View key={edu.id} style={{ alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{edu.degree}</Text>
                                <Text style={{ fontSize: 9 }}>{edu.school}</Text>
                                <Text style={{ fontSize: 8, color: colors.subtext }}>{edu.endDate}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {skills.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.skillRow}>
                            {skills.map(s => (
                                <Text key={s.id} style={{ fontSize: 9, color: colors.text }}>{s.name}</Text>
                            ))}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
};
