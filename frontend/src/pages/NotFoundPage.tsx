import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                bgcolor: 'background.default' 
            }}
        >
            <Paper elevation={3} sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h1" color="primary" gutterBottom>
                    404
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    The page you are looking for does not exist or has been moved.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Go to Dashboard
                </Button>
            </Paper>
        </Box>
    );
};
