import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { TemplateProps } from '../cv/types';
import { createPdfStyles } from './styles';

export const CorporatePdf: React.FC<TemplateProps> = ({ data, config }) => {
    const baseStyles = createPdfStyles(config);
    const { colors } = config;

    const styles = StyleSheet.create({
        ...baseStyles,
        page: {
            ...baseStyles.page,
            padding: 0, // Full width sidebar
            flexDirection: 'row',
        },
        sidebar: {
            width: '32%',
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            padding: 20,
            height: '100%',
        },
        main: {
            width: '68%',
            padding: 30,
            backgroundColor: '#FFFFFF',
        },
        initials: {
            width: 60,
            height: 60,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 30,
            textAlign: 'center',
            fontSize: 24,
            paddingTop: 15, // center vertically-ish
            marginBottom: 20,
            alignSelf: 'center',
            color: '#FFFFFF',
        },
        sidebarSection: {
            marginBottom: 20,
        },
        sidebarTitle: {
            fontSize: 10,
            fontFamily: 'Helvetica-Bold',
            textTransform: 'uppercase',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.3)',
            paddingBottom: 4,
            marginBottom: 8,
            color: '#FFFFFF',
        },
        sidebarText: {
            fontSize: 9,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 3,
        },
        headerMain: {
            borderBottomWidth: 3,
            borderBottomColor: colors.secondary,
            paddingBottom: 20,
            marginBottom: 30,
        },
        mainH1: {
            fontSize: 30,
            fontFamily: 'Helvetica-Bold',
            textTransform: 'uppercase',
            color: colors.secondary,
        },
        mainH2: {
            fontSize: 14,
            color: colors.subtext,
            marginTop: 5,
        }
    });

    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Sidebar */}
                <View style={styles.sidebar}>
                    <View style={styles.initials}>
                        <Text>{personalInfo.fullName.charAt(0)}</Text>
                    </View>

                    <View style={styles.sidebarSection}>
                        <Text style={styles.sidebarTitle}>Contact</Text>
                        <Text style={styles.sidebarText}>{personalInfo.email}</Text>
                        <Text style={styles.sidebarText}>{personalInfo.phone}</Text>
                        <Text style={styles.sidebarText}>{personalInfo.address}</Text>
                    </View>

                    {education.length > 0 && (
                        <View style={styles.sidebarSection}>
                            <Text style={styles.sidebarTitle}>Formation</Text>
                            {education.map(edu => (
                                <View key={edu.id} style={{ marginBottom: 8 }}>
                                    <Text style={[styles.sidebarText, { fontWeight: 'bold', color: '#FFF' }]}>{edu.degree}</Text>
                                    <Text style={styles.sidebarText}>{edu.school}</Text>
                                    <Text style={[styles.sidebarText, { opacity: 0.7 }]}>{edu.endDate}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {skills.length > 0 && (
                        <View style={styles.sidebarSection}>
                            <Text style={styles.sidebarTitle}>Expertise</Text>
                            {skills.map(s => (
                                <Text key={s.id} style={styles.sidebarText}>• {s.name}</Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Main */}
                <View style={styles.main}>
                    <View style={styles.headerMain}>
                        <Text style={styles.mainH1}>{personalInfo.fullName}</Text>
                        <Text style={styles.mainH2}>{personalInfo.title}</Text>
                    </View>

                    {summary && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>A Propos</Text>
                            <Text>{summary}</Text>
                        </View>
                    )}

                    {experiences.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Expériences</Text>
                            {experiences.map(exp => (
                                <View key={exp.id} style={{ marginBottom: 15 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 13 }}>{exp.position}</Text>
                                        <Text style={{ fontSize: 9, backgroundColor: '#f3f4f6', padding: 2, borderRadius: 2 }}>{exp.startDate} - {exp.current ? 'Now' : exp.endDate}</Text>
                                    </View>
                                    <Text style={{ fontSize: 10, color: colors.primary, marginBottom: 4 }}>{exp.company}</Text>
                                    <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{exp.description}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </Page>
        </Document>
    );
};
