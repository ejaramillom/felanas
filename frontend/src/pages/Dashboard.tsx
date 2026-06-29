import React from 'react';
import { Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
    const { user, company } = useAuth();

    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Welcome, {user?.username}!
            </Typography>
            <Typography variant="body1">
                You are managing <strong>{company?.name}</strong>.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Use the navigation bar to manage your users and payroll settings.
            </Typography>
        </Paper>
    );
};
