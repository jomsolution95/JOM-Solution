import React from 'react';
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';
import { PremiumStats as PremiumStatsContent } from '../pages/PremiumStats';

export const PremiumStatsProtected: React.FC = () => {
    return (
        <PremiumFeatureGuard featureId="stats_profile">
            <PremiumStatsContent />
        </PremiumFeatureGuard>
    );
};

export default PremiumStatsProtected;
