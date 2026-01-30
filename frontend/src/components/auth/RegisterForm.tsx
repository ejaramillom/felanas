import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        activationKey: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await register(formData);
            navigate('/'); // Redirect to dashboard or home
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
            <Typography variant="h5" gutterBottom align="center">
                Register Company
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Activation Key"
                    name="activationKey"
                    value={formData.activationKey}
                    onChange={handleChange}
                    margin="normal"
                    required
                    helperText="Enter the key provided to your company"
                />
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3 }}
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register'}
                </Button>
            </Box>
        </Paper>
    );
};
