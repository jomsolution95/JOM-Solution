import React from 'react';
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';
import { MyCertificates as MyCertificatesContent } from '../pages/MyCertificates';

export const MyCertificatesProtected: React.FC = () => {
    return (
        <PremiumFeatureGuard featureId="certificates">
            <MyCertificatesContent />
        </PremiumFeatureGuard>
    );
};

export default MyCertificatesProtected;
