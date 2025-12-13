import React from 'react';
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';
import { AcademyDashboard as AcademyDashboardContent } from '../pages/AcademyDashboard';

export const AcademyDashboardProtected: React.FC = () => {
    return (
        <PremiumFeatureGuard featureId="stats_academy">
            <AcademyDashboardContent />
        </PremiumFeatureGuard>
    );
};

export default AcademyDashboardProtected;
