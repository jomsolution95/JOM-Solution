import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { TemplateProps } from '../cv/types';
import { createPdfStyles } from './styles';

export const CreativePdf: React.FC<TemplateProps> = ({ data, config }) => {
    const { colors } = config;

    const styles = StyleSheet.create({
        page: {
            fontFamily: 'Helvetica',
            fontSize: 10,
            lineHeight: 1.5,
            padding: 0,
            color: '#333',
        },
        headerBg: {
            height: 120,
            backgroundColor: colors.primary,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
        },
        container: {
            padding: 30,
            paddingTop: 80, // Overlap header
        },
        card: {
            backgroundColor: '#FFFFFF',
            padding: 20,
            borderRadius: 8,
            marginBottom: 30,
            // Simulate shadow with border since shadow not supported
            borderWidth: 1,
            borderColor: '#e5e7eb',
        },
        name: {
            fontSize: 28,
            fontFamily: 'Helvetica-Bold',
            color: colors.primary,
            marginBottom: 5,
        },
        title: {
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: '#9ca3af',
        },
        grid: {
            flexDirection: 'row',
            gap: 30,
        },
        leftCol: {
            width: '35%',
        },
        rightCol: {
            width: '65%',
        },
        box: {
            backgroundColor: '#f9fafb',
            padding: 15,
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: colors.secondary,
            marginBottom: 20,
        },
        sectionTitle: {
            fontSize: 10,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: '#9ca3af',
            marginBottom: 10,
        },
        tag: {
            backgroundColor: colors.accent,
            color: '#FFFFFF', // Use white text for contrast on accent if bold accent? Logic says accent often light. Let's assume accent is vivid.
            // If accent is light, we might need dark text.
            // For now, let's use white text but dark bg if accent is dark.
            // Safe bet: text color from config.
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
            fontSize: 8,
            marginRight: 4,
            marginBottom: 4,
        },
        expTitle: {
            fontSize: 18,
            fontFamily: 'Helvetica-Bold',
            color: colors.primary,
            marginBottom: 20,
        },
        timeline: {
            borderLeftWidth: 2,
            borderLeftColor: '#f3f4f6',
            paddingLeft: 20,
            marginLeft: 5,
        },
        dot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.secondary,
            position: 'absolute',
            left: -26,
            top: 4,
        }
    });

    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBg} />

                <View style={styles.container}>
                    {/* Header Card */}
                    <View style={styles.card}>
                        <Text style={styles.name}>{personalInfo.fullName}</Text>
                        <Text style={styles.title}>{personalInfo.title}</Text>
                    </View>

                    <View style={styles.grid}>
                        <View style={styles.leftCol}>
                            <View style={styles.box}>
                                <Text style={styles.sectionTitle}>Contact</Text>
                                <Text style={{ fontSize: 9, marginBottom: 2 }}>{personalInfo.email}</Text>
                                <Text style={{ fontSize: 9, marginBottom: 2 }}>{personalInfo.phone}</Text>
                                <Text style={{ fontSize: 9 }}>{personalInfo.address}</Text>
                            </View>

                            {skills.length > 0 && (
                                <View style={styles.box}>
                                    <Text style={styles.sectionTitle}>Skills</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {skills.map(s => (
                                            <Text key={s.id} style={[styles.tag, { color: colors.text }]}>{s.name}</Text>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={styles.rightCol}>
                            {summary && (
                                <View style={{ marginBottom: 30 }}>
                                    <Text style={{ lineHeight: 1.6, color: '#4b5563' }}>{summary}</Text>
                                </View>
                            )}

                            {experiences.length > 0 && (
                                <View>
                                    <Text style={styles.expTitle}>Experience</Text>
                                    <View style={styles.timeline}>
                                        {experiences.map(exp => (
                                            <View key={exp.id} style={{ marginBottom: 25, position: 'relative' }}>
                                                <View style={styles.dot} />
                                                <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827' }}>{exp.position}</Text>
                                                <Text style={{ fontSize: 9, color: colors.accent, marginBottom: 5, fontWeight: 'bold' }}>{exp.company} | {exp.startDate}</Text>
                                                <Text style={{ fontSize: 10, color: '#4b5563' }}>{exp.description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
