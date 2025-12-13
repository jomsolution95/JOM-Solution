import { StyleSheet, Font } from '@react-pdf/renderer';
import { TemplateConfig } from '../cv/types';

// Register standard fonts (optional, as Helvetica is default)
// For now we rely on default fonts to ensure 100% reliability without downloading assets

export const createPdfStyles = (config: TemplateConfig) => {
    const { colors, fonts } = config;

    // Map our web fonts to PDF safe fonts
    // This is a simplification. For high fidelity we'd register custom fonts.
    const fontFamilyHeading = fonts.headings.includes('serif') ? 'Times-Roman' : 'Helvetica-Bold';
    const fontFamilyBody = fonts.body.includes('serif') ? 'Times-Roman' : 'Helvetica';
    const fontFamilyMono = 'Courier';

    return StyleSheet.create({
        page: {
            backgroundColor: colors.background,
            color: colors.text,
            fontFamily: fontFamilyBody,
            fontSize: 10,
            lineHeight: 1.5,
            padding: 30,
        },
        header: {
            marginBottom: 20,
            borderBottomWidth: 2,
            borderBottomColor: colors.primary,
            paddingBottom: 10,
        },
        h1: {
            fontSize: 24,
            fontFamily: fontFamilyHeading,
            color: colors.secondary,
            textTransform: 'uppercase',
            marginBottom: 4,
        },
        h2: {
            fontSize: 14,
            color: colors.primary,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 8,
        },
        section: {
            marginBottom: 15,
        },
        sectionTitle: {
            fontSize: 11,
            fontFamily: fontFamilyHeading,
            color: colors.primary,
            textTransform: 'uppercase',
            borderBottomWidth: 1,
            borderBottomColor: colors.accent,
            paddingBottom: 2,
            marginBottom: 8,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        bold: {
            fontFamily: fontFamilyHeading, // Usually bold variant
        },
        textSmall: {
            fontSize: 9,
        },
        textMuted: {
            color: colors.subtext,
        },
        // Columns
        cols2: {
            flexDirection: 'row',
            gap: 20,
        },
        leftCol: {
            width: '65%',
        },
        rightCol: {
            width: '35%',
        },
        // Contact line
        contactLine: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            fontSize: 9,
            color: colors.subtext,
        }
    });
};
