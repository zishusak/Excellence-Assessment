import React, { useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, Button, Typography, Box } from '@mui/material';
import axios from 'axios';

const Configuration = ({ open, onClose }) => {
    const [configValues, setConfigValues] = useState({
        MAX_CLASSES_STUDENT_PER_DAY: '',
        MAX_CLASSES_INSTRUCTOR_PER_DAY: '',
        MAX_CLASSES_PER_CLASS_TYPE: '',
        CLASS_DURATION_MINUTES: '',
    });
    const [configResponse, setConfigResponse] = useState(null);
    const [errors, setErrors] = useState({}); // State to handle validation errors

    const handleConfigChange = (event) => {
        setConfigValues({
            ...configValues,
            [event.target.name]: event.target.value,
        });
        setErrors((prevErrors) => ({
            ...prevErrors,
            [event.target.name]: '', // Clear error message for the field being edited
        }));
    };

    const validateFields = () => {
        const newErrors = {};
        let hasErrors = false;

        Object.keys(configValues).forEach((key) => {
            if (!configValues[key]) {
                newErrors[key] = 'This field is required';
                hasErrors = true;
            }
        });

        setErrors(newErrors);
        return !hasErrors;
    };

    const handleConfigSave = async () => {
        if (!validateFields()) return; // Validate fields before making the API request

        try {
            const response = await axios.post('http://localhost:5000/api/schedule/config', configValues);
            setConfigResponse({
                status: 'success',
                message: 'Configuration saved successfully!',
                data: response.data,
            });

            // Reset form values and close dialog after a short delay
            setTimeout(() => {
                setConfigValues({
                    MAX_CLASSES_STUDENT_PER_DAY: '',
                    MAX_CLASSES_INSTRUCTOR_PER_DAY: '',
                    MAX_CLASSES_PER_CLASS_TYPE: '',
                    CLASS_DURATION_MINUTES: '',
                });
                setErrors({});
                onClose();
            }, 2000); // 2 seconds delay to allow success message to be visible
        } catch (error) {
            console.error('Error saving configuration:', error);
            setConfigResponse({
                status: 'error',
                message: error.response?.data?.message || 'Failed to save configuration',
                data: error.response?.data,
            });
        }
    };

    const renderConfigResponseMessages = () => {
        if (!configResponse) return null;

        const messageColor = configResponse.status === 'success' ? 'green' : 'red';
        const backgroundColor = configResponse.status === 'success' ? '#e8f5e9' : '#ffebee';

        return (
            <Box
                mb={2}
                p={2}
                style={{ backgroundColor, borderRadius: '8px' }}
            >
                <Typography variant="body2" style={{ color: messageColor }}>
                    {configResponse.message}
                </Typography>
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent>
                <Typography variant="h6" gutterBottom>Configuration Settings</Typography>
                {renderConfigResponseMessages()}
                <Box mb={2}>
                    <TextField
                        label="Max Classes per Student per Day"
                        name="MAX_CLASSES_STUDENT_PER_DAY"
                        value={configValues.MAX_CLASSES_STUDENT_PER_DAY}
                        onChange={handleConfigChange}
                        fullWidth
                        margin="normal"
                        error={Boolean(errors.MAX_CLASSES_STUDENT_PER_DAY)}
                        helperText={errors.MAX_CLASSES_STUDENT_PER_DAY}
                        type="number"
                    />
                    <TextField
                        label="Max Classes per Instructor per Day"
                        name="MAX_CLASSES_INSTRUCTOR_PER_DAY"
                        value={configValues.MAX_CLASSES_INSTRUCTOR_PER_DAY}
                        onChange={handleConfigChange}
                        fullWidth
                        margin="normal"
                        error={Boolean(errors.MAX_CLASSES_INSTRUCTOR_PER_DAY)}
                        helperText={errors.MAX_CLASSES_INSTRUCTOR_PER_DAY}
                        type="number"
                    />
                    <TextField
                        label="Max Classes per Class Type"
                        name="MAX_CLASSES_PER_CLASS_TYPE"
                        value={configValues.MAX_CLASSES_PER_CLASS_TYPE}
                        onChange={handleConfigChange}
                        fullWidth
                        margin="normal"
                        error={Boolean(errors.MAX_CLASSES_PER_CLASS_TYPE)}
                        helperText={errors.MAX_CLASSES_PER_CLASS_TYPE}
                        type="number"
                    />
                    <TextField
                        label="Class Duration (Minutes)"
                        name="CLASS_DURATION_MINUTES"
                        value={configValues.CLASS_DURATION_MINUTES}
                        onChange={handleConfigChange}
                        fullWidth
                        margin="normal"
                        error={Boolean(errors.CLASS_DURATION_MINUTES)}
                        helperText={errors.CLASS_DURATION_MINUTES}
                        type="number"
                        inputProps={{ min: 0 }} // Prevent negative values
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="primary">Close</Button>
                <Button onClick={handleConfigSave} variant="contained" color="primary">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default Configuration;
