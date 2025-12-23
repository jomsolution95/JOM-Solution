import { CVData } from '../../templates/cv/CVTemplates50';
import { CVState } from '../../stores/useCVStore';

export const mapStoreToCVData = (store: CVState): CVData => {
    return {
        fullName: store.personalInfo.fullName,
        title: store.personalInfo.title,
        summary: store.summary,
        contact: {
            email: store.personalInfo.email,
            phone: store.personalInfo.phone,
            location: store.personalInfo.address,
            website: store.personalInfo.website || store.personalInfo.linkedin
        },
        experiences: store.experiences.map(exp => ({
            role: exp.position,
            company: exp.company,
            start: exp.startDate,
            end: exp.current ? 'Présent' : exp.endDate,
            description: exp.description
        })),
        education: store.education.map(edu => ({
            degree: edu.degree,
            school: edu.school,
            start: edu.startDate,
            end: edu.endDate || '' // Handle optional end date
        })),
        skills: store.skills.map(s => s.name),
        // languages: store.languages.map(l => l.name), // Assuming languages exist in store but not in the subset I saw earlier
        languages: [], // Placeholder if languages not in store
        projects: store.projects?.map(p => ({
            name: p.name,
            desc: p.description,
            link: p.url
        })),
        photoUrl: store.personalInfo.avatar
    };
};
