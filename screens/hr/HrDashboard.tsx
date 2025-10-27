
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const HrDashboard: React.FC = () => {
    const { user } = useAuth();
    return (
        <div>
            <h1 className="text-3xl font-bold text-primary">HR Dashboard for {user?.profile.branch}</h1>
            <p className="text-text-secondary mt-2">This feature is under construction.</p>
        </div>
    );
};

export default HrDashboard;
