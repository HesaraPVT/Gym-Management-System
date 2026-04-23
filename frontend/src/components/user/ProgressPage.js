import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './ProgressPage.css';
import instructionImg from '../../images/instruction.jpeg';

function ProgressPage({ measurements }) {
  const [selectedMetric, setSelectedMetric] = useState('weight');

  const hasEnoughData = measurements.length >= 2;

  // Sort measurements by date for the chart
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const chartData = sortedMeasurements.map((m) => ({
    date: m.date,
    weight: parseFloat(m.weight),
    bodyFat: parseFloat(m.bodyFatPercentage),
    muscleMass: parseFloat(m.muscleMass),
    height: parseFloat(m.height),
  }));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const metricConfig = {
    weight: { label: 'Weight (kg)', color: '#DA2129', gradientId: 'fillWeight' },
    bodyFat: { label: 'Body Fat (%)', color: '#231F20', gradientId: 'fillBodyFat' },
    muscleMass: { label: 'Muscle Mass (kg)', color: '#DA2129', gradientId: 'fillMuscleMass' },
    height: { label: 'Height (cm)', color: '#231F20', gradientId: 'fillHeight' },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-date">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} className="chart-tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="progress-page">
      {!hasEnoughData ? (
        <div className="instruction-section">
          <img
            src={instructionImg}
            alt="Track your progress"
            className="instruction-image"
          />
          <p className="instruction-text">
            Start tracking your journey! Add two or more updates to unlock your
            progress graph.
          </p>
        </div>
      ) : (
        <div>
          {/* Metric Selector */}
          <div className="metric-selector">
            <button
              className={`metric-btn ${selectedMetric === 'weight' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('weight')}
            >
              Weight
            </button>
            <button
              className={`metric-btn ${selectedMetric === 'bodyFat' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('bodyFat')}
            >
              Body Fat
            </button>
            <button
              className={`metric-btn ${selectedMetric === 'muscleMass' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('muscleMass')}
            >
              Muscle Mass
            </button>
            <button
              className={`metric-btn ${selectedMetric === 'height' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('height')}
            >
              Height
            </button>
          </div>

          {/* Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h2 className="chart-title">Progress Graph</h2>
              <p className="chart-subtitle">
                Showing {metricConfig[selectedMetric].label} over time
              </p>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={metricConfig[selectedMetric].gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={metricConfig[selectedMetric].color}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={metricConfig[selectedMetric].color}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#818284' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#818284' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontFamily: 'DM Sans',
                      fontSize: '13px',
                      color: '#231F20',
                    }}
                  />
                  <Area
                    name={metricConfig[selectedMetric].label}
                    dataKey={selectedMetric}
                    type="monotone"
                    fill={`url(#${metricConfig[selectedMetric].gradientId})`}
                    stroke={metricConfig[selectedMetric].color}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressPage;
