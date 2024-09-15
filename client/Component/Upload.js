import React, { Fragment, useState } from 'react';
import { Container, Button, Box, Typography, Paper, Dialog, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import Configration from './Configration';
import ClassSchedule from './ClassSchedule';
import LineGraph from './LineGraph';

const Upload = () => {
    const [csvFileUpload, setCsvFileUpload] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [uploadResults, setUploadResults] = useState([]);
    const [fileResponse, setFileResponse] = useState(null); 
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [classScheduleDialogOpen, setClassScheduleDialogOpen] = useState(false);
    const [lineGraphDialogOpen,setLineGraphDialogOpen] =useState(false)
    const handleCsvFileUpload = () => {
        setCsvFileUpload(true);
    }

    const handleCloseCsvFileUpload = () => {
        setCsvFileUpload(false);
        setSelectedFile(null);
        setFileContent('');
        setUploadResults([]);
        setFileResponse(null); 
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                setFileContent(text);
            };
            reader.readAsText(file);
        }
    };

    // Function to handle the file upload
    const handleSave = async () => {
        if (!selectedFile) {
            setUploadResults([{ status: 'error', message: 'No file selected. Please select a file to upload.', registrationId: null }]);
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile); 

        try {
            const response = await axios.post('http://localhost:5000/api/schedule/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setUploadResults(response.data.results);
            setFileResponse({
                status: 'success',
                message: 'File uploaded successfully!',
                data: response.data.results
            }); 
            console.log(response.data.results);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadResults([{ status: 'error', message: error.response?.data?.message || 'File upload failed', registrationId: null }]);
            setFileResponse({
                status: 'error',
                message: error.response?.data?.message || 'File upload failed',
                data: error.response?.data
            }); 
        }
    };

    const renderResponseMessages = () => {
        if (!fileResponse || !fileResponse.data) return null;

        return fileResponse.data.map((result, index) => {
            const messageColor = result.status === 'success' ? 'green' : 'red';
            const backgroundColor = result.status === 'success' ? '#e8f5e9' : '#ffebee';

            return (
                <Box
                    key={index}
                    mb={2}
                    p={2}
                    style={{ backgroundColor, borderRadius: '8px' }}
                >
                    <Typography variant="body2" style={{ color: messageColor }}>
                        {result.message}
                    </Typography>
                </Box>
            );
        });
    };

    return (
        <Fragment>
            <Container maxWidth="xxl">
            <Typography sx={{color:'blue', alignItems:'center', fontSize:'40px',textAlign:'center',marginTop:'20px'}}>ASSESMENT</Typography>
            <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh', 
                width: '100%',
                padding: 2,
            }}
        >
       
            <Paper
                sx={{
                    padding: '3rem',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '16px',
                    margin: 'auto', 
                    maxWidth: '90%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        flexWrap: 'wrap', 
                        padding: 2,
                        width: '100%',
                    }}
                >
                    <Button
                        sx={{
                            backgroundColor: '#001f3f', 
                            color: 'white',
                            borderRadius: '30px',
                            padding: '12px 24px',
                            margin: '8px',
                            maxWidth: '200px', 
                            whiteSpace: 'normal', 
                            textAlign: 'center',
                            '&:hover': {
                                backgroundColor: '#001a3f', 
                            },
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                        }}
                        onClick={handleCsvFileUpload}
                    >
                        Class Schedule
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: '#001f3f', 
                            color: 'white',
                            borderRadius: '30px',
                            padding: '12px 24px',
                            margin: '8px',
                            maxWidth: '200px', 
                            whiteSpace: 'normal', 
                            textAlign: 'center',
                            '&:hover': {
                                backgroundColor: '#001a3f', 
                            },
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                        }}
                        onClick={() => setClassScheduleDialogOpen(true)}
                    >
                        Class Schedule List
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: '#001f3f', 
                            color: 'white',
                            borderRadius: '30px',
                            padding: '12px 24px',
                            margin: '8px',
                            maxWidth: '200px', 
                            whiteSpace: 'normal',
                            textAlign: 'center',
                            '&:hover': {
                                backgroundColor: '#001a3f', 
                            },
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                        }}
                        onClick={()=> setLineGraphDialogOpen(true)}
                    >
                        SHOW LINE GRAPH
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: '#001f3f', 
                            color: 'white',
                            borderRadius: '30px',
                            padding: '12px 24px',
                            margin: '8px',
                            maxWidth: '200px', 
                            whiteSpace: 'normal', 
                            textAlign: 'center',
                            '&:hover': {
                                backgroundColor: '#001a3f', 
                            },
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                        }}
                        onClick={() => setConfigDialogOpen(true)}
                    >
                        CHANGE CONFIGURATION
                    </Button>
                </Box>
            </Paper>
        </Box>

                <Dialog open={csvFileUpload} onClose={handleCloseCsvFileUpload} maxWidth="md" fullWidth>
                    <DialogContent>
                        <Typography variant="h6" gutterBottom>CSV File Upload</Typography>
                        <Box mb={2}>
                            <Typography variant="body2" color="textSecondary">
                                Please upload a CSV file. The format should include columns like:
                            </Typography>
                            <Typography variant="body2" color="textPrimary">
                                <strong>Example Format:</strong> Name, Email, Phone, Address
                            </Typography>
                        </Box>
                        <Box>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                style={{ marginTop: '10px', marginBottom: '20px' }}
                            />
                        </Box>

                       <Box>

                       {selectedFile && (
                            <Typography variant="body2" color="textSecondary" sx={{marginBottom:'20px'}}>
                                Selected File: {selectedFile.name}
                            </Typography>
                        )}
                       </Box>

                        {fileContent && (
                            <Box mt={2} p={2} style={{ backgroundColor: '#f4f4f4', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto',marginTop:'20px',marginBottom:'20px' }}>
                                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                                    {fileContent}
                                </Typography>
                            </Box>
                        )}

                        {renderResponseMessages()}

                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleCloseCsvFileUpload} variant="outlined" color="primary">Close</Button>
                        <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
                    </DialogActions>
                </Dialog>
                <Configration open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} />
                <ClassSchedule open={classScheduleDialogOpen} onClose={() => setClassScheduleDialogOpen(false)} />
                <LineGraph open={lineGraphDialogOpen} onClose={()=> setLineGraphDialogOpen(false)} />
            </Container>
        </Fragment>
    );
}

export default Upload;
