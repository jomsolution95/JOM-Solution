import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { TemplateProps } from '../cv/types';

export const ATSPdf: React.FC<TemplateProps> = ({ data }) => {
    // Pure black and white, simple layout
    const styles = StyleSheet.create({
        page: {
            padding: 40,
            fontFamily: 'Times-Roman',
            fontSize: 11,
            lineHeight: 1.4,
            color: '#000000',
        },
        header: {
            textAlign: 'center',
            marginBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#000000',
            paddingBottom: 10,
        },
        name: {
            fontSize: 18, // Reduced from 24 to fit single line if long
            fontWeight: 'bold', // Times-Roman doesn't use fontWeight weight but font family name change
            fontFamily: 'Times-Bold',
            textTransform: 'uppercase',
            marginBottom: 5,
        },
        contact: {
            fontSize: 10,
            marginBottom: 2,
        },
        sectionTitle: {
            fontSize: 12,
            fontFamily: 'Times-Bold',
            textTransform: 'uppercase',
            borderBottomWidth: 1,
            borderBottomColor: '#cccccc',
            marginTop: 15,
            marginBottom: 8,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        bold: {
            fontFamily: 'Times-Bold',
        },
        italic: {
            fontFamily: 'Times-Italic',
        }
    });

    const { personalInfo, summary, experiences, education, skills } = data;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.name}>{personalInfo.fullName}</Text>
                    <Text style={styles.contact}>
                        {[personalInfo.address, personalInfo.email, personalInfo.phone].filter(Boolean).join(' | ')}
                    </Text>
                    {personalInfo.linkedin && <Text style={styles.contact}>{personalInfo.linkedin}</Text>}
                </View>

                {summary && (
                    <View>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text>{summary}</Text>
                    </View>
                )}

                {experiences.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {experiences.map((exp) => (
                            <View key={exp.id} style={{ marginBottom: 10 }}>
                                <View style={styles.row}>
                                    <Text style={styles.bold}>{exp.position}</Text>
                                    <Text style={styles.bold}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                                </View>
                                <Text style={styles.italic}>{exp.company}, {exp.location}</Text>
                                <Text style={{ marginTop: 2 }}>{exp.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {education.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {education.map((edu) => (
                            <View key={edu.id} style={{ marginBottom: 5 }}>
                                <View style={styles.row}>
                                    <Text style={styles.bold}>{edu.school}</Text>
                                    <Text style={styles.bold}>{edu.endDate}</Text>
                                </View>
                                <Text>{edu.degree}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {skills.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <Text>{skills.map(s => s.name).join(', ')}</Text>
                    </View>
                )}
            </Page>
        </Document>
    );
};
