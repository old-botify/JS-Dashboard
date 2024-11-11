import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BrandedAnalysis = ({ filteredData, chartMetric }) => {
  const [excludedCategories, setExcludedCategories] = useState([]);

  const toggleCategory = (category) => {
    setExcludedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const brandedChartData = useMemo(() => {
    const groupedData = filteredData.reduce((acc, item) => {
      if (!excludedCategories.includes(item.category)) {
        if (!acc[item.category]) {
          acc[item.category] = { 
            category: item.category, 
            brandedSearchVolume: 0, 
            nonBrandedSearchVolume: 0,
            brandedCount: 0,
            nonBrandedCount: 0
          };
        }
        if (item.isBranded) {
          acc[item.category].brandedSearchVolume += item.searchVolume;
          acc[item.category].brandedCount += 1;
        } else {
          acc[item.category].nonBrandedSearchVolume += item.searchVolume;
          acc[item.category].nonBrandedCount += 1;
        }
      }
      return acc;
    }, {});
    return Object.values(groupedData);
  }, [filteredData, excludedCategories]);

  const uniqueCategories = useMemo(() => 
    [...new Set(filteredData.map(item => item.category))],
    [filteredData]
  );

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Branded Analysis</h2>
      <div style={styles.categoryToggle}>
        {uniqueCategories.map(category => (
          <label key={category} style={styles.categoryLabel}>
            <input
              type="checkbox"
              checked={!excludedCategories.includes(category)}
              onChange={() => toggleCategory(category)}
              style={styles.categoryCheckbox}
            />
            {category}
          </label>
        ))}
      </div>
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={brandedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <XAxis 
              dataKey="category" 
              interval={0}
              tick={{ angle: -45, textAnchor: 'end', fontSize: 12 }}
              height={70}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => chartMetric === 'searchVolume' ? value.toLocaleString() : value}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey={chartMetric === 'searchVolume' ? 'brandedSearchVolume' : 'brandedCount'}
              fill="#4ECDC4"
              name="Branded"
              stackId="a"
            />
            <Bar 
              dataKey={chartMetric === 'searchVolume' ? 'nonBrandedSearchVolume' : 'nonBrandedCount'}
              fill="#FF6B6B"
              name="Non-Branded"
              stackId="a"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p style={styles.description}>
        This chart shows the distribution of Branded vs Non-Branded keywords across categories based on {chartMetric === 'searchVolume' ? 'search volume' : 'keyword count'}.
      </p>
    </div>
  );
};

const styles = {
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#6a0dad',
  },
  chartContainer: {
    width: '100%',
    height: '400px',
  },
  description: {
    marginTop: '20px',
    fontSize: '1rem',
    color: '#666',
    textAlign: 'center',
  },
  categoryToggle: {
    marginBottom: '20px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  categoryLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  categoryCheckbox: {
    marginRight: '5px',
  },
};

export default BrandedAnalysis;