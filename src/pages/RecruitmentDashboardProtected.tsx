import React from 'react';
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';
import { RecruitmentDashboard as RecruitmentDashboardContent } from '../pages/RecruitmentDashboard';

export const RecruitmentDashboardProtected: React.FC = () => {
    return (
        <PremiumFeatureGuard featureId="stats_recruitment">
            <RecruitmentDashboardContent />
        </PremiumFeatureGuard>
    );
};

export default RecruitmentDashboardProtected;
