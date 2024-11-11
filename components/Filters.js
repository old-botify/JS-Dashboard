import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function Filters({
  data = [], // Provide default empty array
  categoryFilters,
  setCategoryFilters,
  searchVolumeFilter,
  setSearchVolumeFilter,
  brandedFilter,
  setBrandedFilter,
  keywordFilter,
  setKeywordFilter,
  showCompetitors,
  setShowCompetitors,
  selectedCompetitors,
  setSelectedCompetitors,
  rankRange,
  setRankRange
}) {
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  const categories = useMemo(() => 
    data && data.length > 0 ? [...new Set(data.map(item => item.category))] : []
  , [data]);
  
  const categoryOptions = useMemo(() => 
    categories.map(category => ({ value: category, label: category }))
  , [categories]);

  const competitors = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const allCompetitors = new Set();
    data.forEach(item => {
      if (item.competitors && Array.isArray(item.competitors)) {
        item.competitors.forEach(comp => {
          if (comp && comp.name) {
            allCompetitors.add(comp.name);
          }
        });
      }
    });
    return Array.from(allCompetitors);
  }, [data]);

  const competitorOptions = useMemo(() => 
    competitors.map(comp => ({ value: comp, label: comp }))
  , [competitors]);

  const handleCategoryChange = (selectedOptions) => {
    setCategoryFilters(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleCompetitorChange = (selectedOptions) => {
    setSelectedCompetitors(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleRankRangeChange = (type, value) => {
    const newValue = parseInt(value, 10);
    if (isNaN(newValue) || newValue < 0 || newValue > 100) return;

    if (type === 'min') {
      setRankRange([newValue, Math.max(newValue, rankRange[1])]);
    } else {
      setRankRange([Math.min(rankRange[0], newValue), newValue]);
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#ddd',
      '&:hover': {
        borderColor: '#6a0dad'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#6a0dad' : state.isFocused ? '#f0e6f7' : null,
      color: state.isSelected ? 'white' : '#333',
    }),
  };

  if (!data) {
    return (
      <div style={styles.section}>
        <div style={styles.loadingState}>
          Loading filters...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <button
        onClick={() => setIsFiltersVisible(!isFiltersVisible)}
        style={styles.toggleButton}
      >
        <span>Filters</span>
        {isFiltersVisible ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isFiltersVisible && (
        <div style={styles.filtersContainer}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Categories</label>
              <Select
                isMulti
                options={categoryOptions}
                value={categoryFilters.map(cat => ({ value: cat, label: cat }))}
                onChange={handleCategoryChange}
                styles={customStyles}
              />
            </div>
            <div>
              <label htmlFor="search-volume-filter" style={styles.label}>
                Minimum Search Volume
              </label>
              <input
                id="search-volume-filter"
                type="number"
                value={searchVolumeFilter}
                onChange={(e) => setSearchVolumeFilter(Number(e.target.value))}
                style={styles.input}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="keyword-filter" style={styles.label}>Keyword Filter</label>
              <input
                id="keyword-filter"
                type="text"
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
                placeholder="e.g., keyword one, keyword two"
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.checkboxContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showCompetitors}
                onChange={(e) => setShowCompetitors(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Show Competitors</span>
            </label>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={brandedFilter}
                onChange={(e) => setBrandedFilter(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Branded Only</span>
            </label>
            {showCompetitors && (
              <div style={styles.rankContainer}>
                <label style={styles.label}>Rank Range:</label>
                <input
                  type="number"
                  value={rankRange[0]}
                  onChange={(e) => handleRankRangeChange('min', e.target.value)}
                  style={styles.rankInput}
                  min="1"
                  max="100"
                />
                <span>-</span>
                <input
                  type="number"
                  value={rankRange[1]}
                  onChange={(e) => handleRankRangeChange('max', e.target.value)}
                  style={styles.rankInput}
                  min="1"
                  max="100"
                />
              </div>
            )}
          </div>
          {showCompetitors && (
            <div style={{marginTop: '20px'}}>
              <label style={styles.label}>Select Competitors</label>
              <Select
                isMulti
                options={competitorOptions}
                value={selectedCompetitors.map(comp => ({ value: comp, label: comp }))}
                onChange={handleCompetitorChange}
                styles={customStyles}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    marginBottom: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  loadingState: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
  toggleButton: {
    width: '100%',
    backgroundColor: '#6a0dad',
    color: 'white',
    padding: '15px',
    border: 'none',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  filtersContainer: {
    padding: '30px',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
    borderTop: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  checkboxContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#333',
  },
  checkbox: {
    marginRight: '8px',
    width: '18px',
    height: '18px',
    accentColor: '#6a0dad',
  },
  rankContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  rankInput: {
    width: '60px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
};