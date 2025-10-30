import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BranchFinancialOverview from '../../components/finance/BranchFinancialOverview';

const FinanceCommandCenter: React.FC = () => {
    const { user } = useAuth();

    if (!user || !user.profile.branch) {
        return (
            <div className="p-4 text-center text-text-secondary">
                Informasi cabang pengguna tidak tersedia.
            </div>
        );
    }
    
    return <BranchFinancialOverview branch={user.profile.branch} />;
};

export default FinanceCommandCenter;