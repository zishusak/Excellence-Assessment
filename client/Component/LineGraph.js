import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Dialog, DialogContent, DialogActions, Typography, Box, Button } from '@mui/material';
// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ClassScheduleChart = ({ open, onClose }) => {
  const [chartData, setChartData] = useState({
    labels: [], // Dates for the x-axis
    datasets: [
      {
        label: 'Scheduled Classes',
        data: [], // Class counts for the y-axis
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false,
      }
    ]
  });

  // Fetch the class data from the backend API
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:5000/api/schedule/class-schedule/daily-count');
      const result = await response.json();

      const dates = result.data.map(item => item.date);
      const classCounts = result.data.map(item => item.count);

      setChartData({
        labels: dates, // x-axis labels (dates)
        datasets: [
          {
            label: 'Scheduled Classes',
            data: classCounts, // y-axis data (counts)
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
          }
        ]
      });
    };

    fetchData();
  }, []);

  // Chart options (customize as needed)
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Scheduled Classes Per Day',
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Classes'
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent>
      <h2>Scheduled Classes Per Day</h2>
      <Line data={chartData} options={options} />
   
    </DialogContent>
    <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">Close</Button>
    </DialogActions>
</Dialog>
   
    </div>
  );
};

export default ClassScheduleChart;
