import React from 'react';
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';
import { RecruitmentPacks as RecruitmentPacksContent } from '../pages/RecruitmentPacks';

export const RecruitmentPacksProtected: React.FC = () => {
    return (
        <PremiumFeatureGuard featureId="recruitment_packs">
            <RecruitmentPacksContent />
        </PremiumFeatureGuard>
    );
};

export default RecruitmentPacksProtected;
