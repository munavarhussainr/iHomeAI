"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  Tooltip,
  Title,
  Filler,
  LineController,
  PointElement,
  ChartTypeRegistry,
} from "chart.js";

// Register the necessary components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Tooltip,
  Title,
  Filler
);

// Define types for the sample data
interface DaywiseData {
  date: string;
  totalwatthr: number;
}

interface HourwiseData {
  date: string;
  hour: string;
  totalwatthr: number;
}

interface SampleData {
  daywise_data: DaywiseData[];
  hourwise_data: HourwiseData[];
}

export default function Home() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart<keyof ChartTypeRegistry, number[], string> | null>(null);
  const [view, setView] = useState("daywise");
  const [selectedDate, setSelectedDate] = useState("2024-10-25");
  const [chartType, setChartType] = useState<keyof ChartTypeRegistry>("bar");

  const jsonString = `{
    "daywise_data": [
      {"date": "2024-10-25", "totalwatthr": 835},
      {"date": "2024-10-30", "totalwatthr": 512},
      {"date": "2024-10-21", "totalwatthr": 446},
      {"date": "2024-10-31", "totalwatthr": 264},
      {"date": "2024-10-26", "totalwatthr": 285},
      {"date": "2024-10-27", "totalwatthr": 335},
      {"date": "2024-10-28", "totalwatthr": 509},
      {"date": "2024-10-24", "totalwatthr": 389},
      {"date": "2024-10-23", "totalwatthr": 318},
      {"date": "2024-10-22", "totalwatthr": 441},
      {"date": "2024-10-29", "totalwatthr": 223},
      {"date": "2024-10-20", "totalwatthr": 48}
    ],
    "hourwise_data": [
      {"date": "2024-10-25", "hour": "07", "totalwatthr": 155},
      {"date": "2024-10-25", "hour": "11", "totalwatthr": 45},
      {"date": "2024-10-25", "hour": "12", "totalwatthr": 281},
      {"date": "2024-10-25", "hour": "16", "totalwatthr": 119},
      {"date": "2024-10-25", "hour": "21", "totalwatthr": 159},
      {"date": "2024-10-25", "hour": "10", "totalwatthr": 76},
      {"date": "2024-10-30", "hour": "17", "totalwatthr": 129},
      {"date": "2024-10-30", "hour": "10", "totalwatthr": 124},
      {"date": "2024-10-30", "hour": "05", "totalwatthr": 165},
      {"date": "2024-10-30", "hour": "13", "totalwatthr": 94},
      {"date": "2024-10-21", "hour": "09", "totalwatthr": 210},
      {"date": "2024-10-21", "hour": "21", "totalwatthr": 171},
      {"date": "2024-10-21", "hour": "15", "totalwatthr": 65},
      {"date": "2024-10-31", "hour": "06", "totalwatthr": 136},
      {"date": "2024-10-31", "hour": "09", "totalwatthr": 128},
      {"date": "2024-10-26", "hour": "11", "totalwatthr": 131},
      {"date": "2024-10-26", "hour": "17", "totalwatthr": 154},
      {"date": "2024-10-27", "hour": "07", "totalwatthr": 153},
      {"date": "2024-10-27", "hour": "11", "totalwatthr": 120},
      {"date": "2024-10-27", "hour": "22", "totalwatthr": 33},
      {"date": "2024-10-27", "hour": "21", "totalwatthr": 29},
      {"date": "2024-10-28", "hour": "17", "totalwatthr": 145},
      {"date": "2024-10-28", "hour": "11", "totalwatthr": 160},
      {"date": "2024-10-28", "hour": "09", "totalwatthr": 168},
      {"date": "2024-10-28", "hour": "19", "totalwatthr": 14},
      {"date": "2024-10-28", "hour": "16", "totalwatthr": 22},
      {"date": "2024-10-24", "hour": "19", "totalwatthr": 145},
      {"date": "2024-10-24", "hour": "07", "totalwatthr": 124},
      {"date": "2024-10-24", "hour": "09", "totalwatthr": 67},
      {"date": "2024-10-24", "hour": "11", "totalwatthr": 53},
      {"date": "2024-10-23", "hour": "13", "totalwatthr": 152},
      {"date": "2024-10-23", "hour": "11", "totalwatthr": 54},
      {"date": "2024-10-23", "hour": "07", "totalwatthr": 105},
      {"date": "2024-10-23", "hour": "14", "totalwatthr": 7},
      {"date": "2024-10-22", "hour": "21", "totalwatthr": 145},
      {"date": "2024-10-22", "hour": "11", "totalwatthr": 141},
      {"date": "2024-10-22", "hour": "09", "totalwatthr": 150},
      {"date": "2024-10-22", "hour": "10", "totalwatthr": 5},
      {"date": "2024-10-29", "hour": "10", "totalwatthr": 223},
      {"date": "2024-10-20", "hour": "12", "totalwatthr": 48}
    ]
  }`;

  const handleViewChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setView(event.target.value);
  };

  const handleChartTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setChartType(event.target.value as keyof ChartTypeRegistry);
  };

  const sampleData: SampleData = JSON.parse(jsonString);

  const formatHour = (hour: string) => {
    const hourNum = parseInt(hour, 10);
    const isPM = hourNum >= 12;
    const formattedHour = hourNum % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHour}:00 ${isPM ? 'PM' : 'AM'}`;
  };

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");

    if (!ctx) {
      console.error("Chart reference is null or context could not be obtained.");
      return; // Exit the effect if the context is not available
    }

    let labels: string[] = [];
    let data: number[] = [];

    // Prepare data based on the selected view
    if (view === "daywise") {
      const daywiseData = sampleData.daywise_data.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      labels = daywiseData.map((item) => item.date);
      data = daywiseData.map((item) => item.totalwatthr);
    } else {
      const hourwiseData = sampleData.hourwise_data
        .filter((item) => item.date === selectedDate)
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
      labels = hourwiseData.map((item) => formatHour(item.hour));
      data = hourwiseData.map((item) => item.totalwatthr);
    }

    // Destroy any previous chart instance before creating a new one
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create the new chart
    chartInstanceRef.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: view === "daywise" ? "Total Watt-Hours by Day" : `Total Watt-Hours on ${selectedDate}`,
            data: data,
            backgroundColor: chartType === "bar" ? "rgba(75,192,192,0.6)" : "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderWidth: 1,
            fill: chartType === "line",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: { enabled: true },
          title: { display: true, text: view === "daywise" ? "Day-wise Watt-Hours" : `Watt-Hours on ${selectedDate}` },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }, [selectedDate, view, chartType]); // Rerun useEffect whenever selectedDate, view, or chartType changes

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">Energy Meter Usage</h1>

      {/* View Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="view-select">Select View: </label>
        <select id="view-select" value={view} onChange={handleViewChange}>
          <option value="daywise">Day-wise Data</option>
          <option value="hourwise">Hour-wise Data</option>
        </select>
      </div>

      {/* Chart Type Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="chart-type-select">Select Chart Type: </label>
        <select id="chart-type-select" value={chartType} onChange={handleChartTypeChange}>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>
      </div>

      {/* Date Selection Dropdown */}
      {view === "hourwise" && (
        <div className="mb-4">
          <label htmlFor="date-select" className="mr-2">Select Date:</label>
          <select
            id="date-select"
            onChange={(e) => setSelectedDate(e.target.value)}
            value={selectedDate}
            className="p-2 border rounded"
          >
            {sampleData.daywise_data.map((item) => (
              <option key={item.date} value={item.date}>
                {item.date}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chart Display */}
      <div className="relative h-96">
        <canvas ref={chartRef} width="400" height="300" />
      </div>
    </div>
  );
}
