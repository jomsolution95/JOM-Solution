import api from '../api/client';
import { CVState, Experience, Education, Skill } from '../stores/useCVStore';

interface AutoFillResult {
    success: boolean;
    mappedData?: Partial<CVState>;
    missingFields: string[];
    message: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const fetchAndMapProfileToCV = async (): Promise<AutoFillResult> => {
    try {
        // Fetch user profile
        // Assuming endpoint exists and returns the profile structure defined in backend
        const response = await api.get('/users/profile');
        const profile = response.data;

        if (!profile) {
            return {
                success: false,
                missingFields: [],
                message: "Impossible de récupérer le profil utilisateur."
            };
        }

        const missingFields: string[] = [];
        const mappedData: Partial<CVState> = {};

        // 1. Personal Info
        const user = profile.user || {};
        mappedData.personalInfo = {
            fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user.name || '',
            title: profile.title || profile.headline || '', // 'headline' in User interface, title in Profile schema
            email: user.email || '',
            phone: profile.phone || '',
            address: profile.location || '',
            website: profile.website || '',
            linkedin: '', // TODO: Add social links to Profile schema/UI if not present
            github: '',
            avatar: profile.avatarUrl || user.avatar || '',
        };

        if (!mappedData.personalInfo.fullName) missingFields.push('Nom complet');
        if (!mappedData.personalInfo.title) missingFields.push('Titre/Poste');
        if (!mappedData.personalInfo.phone) missingFields.push('Téléphone');

        // 2. Summary
        mappedData.summary = profile.bio || profile.about || '';
        if (!mappedData.summary) missingFields.push('Résumé/Bio');

        // 3. Skills
        if (profile.skills && Array.isArray(profile.skills)) {
            mappedData.skills = profile.skills.map((skillName: string) => ({
                id: generateId(),
                name: skillName,
                level: 3 // Default level
            }));
        } else {
            mappedData.skills = [];
            missingFields.push('Compétences');
        }

        // 4. Experience
        // Assuming profile.experience follows the schema: { title, organization, startDate, endDate, description }
        if (profile.experience && Array.isArray(profile.experience)) {
            mappedData.experiences = profile.experience.map((exp: any) => ({
                id: generateId(),
                position: exp.title || '',
                company: exp.organization || '',
                location: '', // Not in schema often
                startDate: exp.startDate ? new Date(exp.startDate).getFullYear().toString() : '',
                endDate: exp.endDate ? new Date(exp.endDate).getFullYear().toString() : '',
                current: !exp.endDate,
                description: exp.description || ''
            }));
        } else {
            mappedData.experiences = [];
            // Not necessarily missing, maybe just empty
        }

        // 5. Education
        // Assuming profile.education: { degree, school, year }
        if (profile.education && Array.isArray(profile.education)) {
            mappedData.education = profile.education.map((edu: any) => ({
                id: generateId(),
                degree: edu.degree || '',
                school: edu.school || '',
                location: '',
                startDate: '',
                endDate: edu.year ? edu.year.toString() : '',
                current: false,
                description: ''
            }));
        } else {
            mappedData.education = [];
        }

        return {
            success: true,
            mappedData,
            missingFields,
            message: `Import réussi ! ${missingFields.length > 0 ? 'Certains champs sont manquants.' : 'Profil complet importé.'}`
        };

    } catch (error) {
        console.error('Error auto-filling CV:', error);
        return {
            success: false,
            missingFields: [],
            message: "Erreur lors de la récupération des données profil."
        };
    }
};
