import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, Button, Typography, Box, Paper, MenuItem, InputAdornment } from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search'; // Import icon
import FilterListIcon from '@mui/icons-material/FilterList'; // Import icon
import DatePicker from 'react-datepicker'; // Import react-datepicker
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for the date picker
import { format } from 'date-fns'; // Import date-fns for formatting


const ClassSchedule = ({ open, onClose }) => {
    const [classSchedules, setClassSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [instructorFilter, setInstructorFilter] = useState('');
    const [instructors, setInstructors] = useState([]);

    useEffect(() => {
        if (open) {
            fetchInstructors(); // Fetch instructor list on component mount
            fetchClassSchedules(); // Fetch the class schedule with or without filters
        }
    }, [open]);

    const fetchClassSchedules = async () => {
        try {
            const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''; // Format the selected date
            const instructorName = instructorFilter ? instructorFilter : ''; // Get the selected instructor's name

            // Construct API URL with date and instructorName
            const apiUrl = `http://localhost:5000/api/schedule/class-schedule/report?date=${formattedDate}&instructorName=${instructorName}`;

            const response = await axios.get(apiUrl);
            setClassSchedules(response.data.data); // Adjust based on the API response structure
        } catch (error) {
            console.error('Error fetching class schedules:', error);
        }
    };

    const fetchInstructors = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/schedule/class-schedule/instructorlist');
            setInstructors(response.data.data);
        } catch (error) {
            console.error('Error fetching instructors:', error);
        }
    };

    const handleInstructorChange = (event) => {
        setInstructorFilter(event.target.value);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    // Call fetchClassSchedules whenever date or instructor changes
    useEffect(() => {
        if (open) {
            fetchClassSchedules(); // Re-fetch the class schedule with the updated filters
        }
    }, [selectedDate, instructorFilter]);
    const datePickerStyle = {
        width: '250px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
    };

    const inputStyle = {
        width: '100%',
        height: '100%',
        boxSizing: 'border-box', // Ensure padding and border are included in the width and height
    };
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent>
                <Typography variant="h6" gutterBottom>Class Schedule List</Typography>
                <Box mb={2} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                       
                    <DatePicker
    selected={selectedDate}
    onChange={handleDateChange}
    style={{ width: '250px', height: '60px' }} // Apply height and width here
    dateFormat="MM/dd/yyyy"
    placeholderText="Select Date"
    className="react-datepicker__input"
/>

                       
                        <TextField
                            select
                            label="Instructor"
                            value={instructorFilter}
                            onChange={handleInstructorChange}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <FilterListIcon />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value="">
                                <em>All Instructors</em>
                            </MenuItem>
                            {instructors.length ? (
                                instructors.map((instructor) => (
                                    <MenuItem key={instructor.id} value={instructor.name}>
                                        {instructor.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No Instructors Found</MenuItem>
                            )}
                        </TextField>
                    </Box>
                    <Paper sx={{ padding: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, borderBottom: '2px solid #ddd', padding: '10px 0' }}>
                            <Typography variant="body2" fontWeight="bold">Student ID</Typography>
                            <Typography variant="body2" fontWeight="bold">Instructor ID</Typography>
                            <Typography variant="body2" fontWeight="bold">Time</Typography>
                            <Typography variant="body2" fontWeight="bold">Class Type</Typography>
                        </Box>
                        {classSchedules.length ? (
                            classSchedules.map((schedule, index) => (
                                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                                    <Typography variant="body2">{schedule.studentId}</Typography>
                                    <Typography variant="body2">{schedule.instructorId}</Typography>
                                    <Typography variant="body2">
                                        {format(new Date(schedule.startTime), 'MM/dd/yyyy HH:mm')} - {format(new Date(schedule.endTime), 'HH:mm')}
                                    </Typography>
                                    <Typography variant="body2">{schedule.classTypeId}</Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary">No schedules found</Typography>
                        )}
                    </Paper>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="primary">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClassSchedule;