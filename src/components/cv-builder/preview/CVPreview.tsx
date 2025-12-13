import React from 'react';
import { useCVStore } from '../../../stores/useCVStore';
import { cvTemplates, TemplateComponents } from '../../../templates/cv';

export const CVPreview: React.FC = () => {
    const {
        personalInfo,
        summary,
        experiences,
        education,
        skills,
        languages,
        projects,
        interests,
        selectedTemplateId
    } = useCVStore();

    // Find the config for the selected template
    const selectedConfig = cvTemplates.find(t => t.id === selectedTemplateId) || cvTemplates[0];

    // Find the component for the archetype
    const TemplateComponent = TemplateComponents[selectedConfig.archetype];

    if (!TemplateComponent) {
        return <div>Template not found</div>;
    }

    // Prepare data object
    const data = {
        personalInfo,
        summary,
        experiences,
        education,
        skills,
        languages,
        projects,
        interests
    };

    return (
        <div className="origin-top transform scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] xl:scale-100 transition-transform duration-300">
            <TemplateComponent data={data} config={selectedConfig} />
        </div>
    );
};
