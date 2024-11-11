import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * KeywordTable Component
 * 
 * This component displays the filtered keyword data in a paginated table format.
 * It also provides functionality for downloading and copying selected keywords,
 * and displays statistics about the selected keywords.
 * 
 * Features:
 * - Displays keywords with their categories and search volumes
 * - Shows competitor information when enabled
 * - Provides checkboxes for selecting individual keywords
 * - Implements pagination for large datasets
 * - Allows for selecting all visible keywords on the current page
 * - Provides buttons for downloading all data, selected data, and copying selected data
 * - Displays statistics about selected keywords
 * 
 * The component receives filtered data, pagination controls, and keyword
 * selection handlers as props from the parent Dashboard component.
 */

const KeywordTable = ({
  filteredData,
  currentPage,
  setCurrentPage,
  showCompetitors,
  selectedKeywords,
  handleKeywordSelect
}) => {
  const [allVisibleSelected, setAllVisibleSelected] = useState(false);
  const itemsPerPage = 100;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSelectAllVisible = useCallback((event) => {
    const isChecked = event.target.checked;
    setAllVisibleSelected(isChecked);
    
    const visibleKeywords = paginatedData.map(item => item.keyword);
    visibleKeywords.forEach(keyword => {
      handleKeywordSelect(keyword);
    });
  }, [paginatedData, handleKeywordSelect]);

  useEffect(() => {
    setAllVisibleSelected(false);
  }, [currentPage, filteredData]);

  const capitalizeFirstLetter = (string) => {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const downloadCSV = useCallback(() => {
    const csvContent = [
      ['keyword', 'category', 'search volume'],
      ...filteredData.map(item => [item.keyword, item.category, item.searchVolume])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'client_gap_analysis.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [filteredData]);

  const copySelectedKeywords = useCallback(() => {
    const selectedData = filteredData
      .filter(item => selectedKeywords.has(item.keyword))
      .map(item => `${item.keyword},${item.category},${item.searchVolume}`)
      .join('\n');
    navigator.clipboard.writeText(`keyword,category,search volume\n${selectedData}`);
    alert('Selected keywords copied to clipboard!');
  }, [filteredData, selectedKeywords]);

  const downloadSelectedKeywords = useCallback(() => {
    const selectedData = filteredData
      .filter(item => selectedKeywords.has(item.keyword))
      .map(item => `${item.keyword},${item.category},${item.searchVolume}`)
      .join('\n');
    const csvContent = `keyword,category,search volume\n${selectedData}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'selected_keywords.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [filteredData, selectedKeywords]);

  const selectedKeywordsStats = useMemo(() => {
    const selectedItems = filteredData.filter(item => selectedKeywords.has(item.keyword));
    const totalSearchVolume = selectedItems.reduce((sum, item) => sum + item.searchVolume, 0);
    return { totalKeywords: selectedItems.length, totalSearchVolume };
  }, [filteredData, selectedKeywords]);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Filtered Keywords</h2>
      <div style={styles.buttonContainer}>
        <button onClick={downloadCSV} style={styles.button}>
          Download All CSV
        </button>
        {selectedKeywords.size > 0 && (
          <>
            <button onClick={copySelectedKeywords} style={styles.button}>
              Copy Selected
            </button>
            <button onClick={downloadSelectedKeywords} style={styles.button}>
              Download Selected
            </button>
          </>
        )}
      </div>
      <div style={styles.statsContainer}>
        <p><strong>Total Selected Keywords:</strong> {selectedKeywordsStats.totalKeywords.toLocaleString()}</p>
        <p><strong>Total Search Volume for Selected Keywords:</strong> {selectedKeywordsStats.totalSearchVolume.toLocaleString()}</p>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={handleSelectAllVisible}
                  style={{
                    ...styles.checkbox,
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#6a0dad'
                  }}
                />
                Select All
              </th>
              <th style={styles.th}>Keyword</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Search Volume</th>
              {showCompetitors && <th style={styles.th}>Competitors</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item.keyword} style={{backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'}}>
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={selectedKeywords.has(item.keyword)}
                    onChange={() => handleKeywordSelect(item.keyword)}
                    style={{
                      ...styles.checkbox,
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#6a0dad'
                    }}
                  />
                </td>
                <td style={styles.td}>
                  {capitalizeFirstLetter(item.keyword)}
                  {item.isBranded && (
                    <span style={styles.brandedTag}>Branded</span>
                  )}
                </td>
                <td style={styles.td}>{item.category}</td>
                <td style={styles.td}>{item.searchVolume.toLocaleString()}</td>
                {showCompetitors && (
                  <td style={styles.td}>
                    {item.competitors.map(competitor => (
                      competitor.name === 'client.com' ? (
                        <span key={competitor.name} style={styles.clientTag}>
                          CLIENT: {competitor.rank}
                        </span>
                      ) : (
                        <span key={competitor.name} style={styles.competitorTag}>
                          {competitor.name}: {competitor.rank}
                        </span>
                      )
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{...styles.button, opacity: currentPage === 1 ? 0.5 : 1}}
        >
          Previous
        </button>
        <span style={{fontSize: '1rem', fontWeight: '600'}}>
          Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
        </span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage)))}
          disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
          style={{...styles.button, opacity: currentPage === Math.ceil(filteredData.length / itemsPerPage) ? 0.5 : 1}}
        >
          Next
        </button>
      </div>
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
  buttonContainer: {
    marginBottom: '20px',
  },
  statsContainer: {
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderSpacing: '0 10px',
  },
  th: {
    backgroundColor: '#6a0dad',
    color: 'white',
    padding: '15px',
    textAlign: 'left',
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.3s ease',
  },
  checkbox: {
    marginRight: '8px',
    accentColor: '#6a0dad',
  },
  brandedTag: {
    backgroundColor: '#6a0dad',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '0.8em',
    marginLeft: '8px',
    fontWeight: '600',
  },
  competitorTag: {
    display: 'inline-block',
    padding: '2px 6px',
    margin: '2px',
    borderRadius: '12px',
    fontSize: '0.8em',
    backgroundColor: '#e0e0e0',
    color: '#333',
  },
  clientTag: {
    display: 'inline-block',
    padding: '2px 6px',
    margin: '2px',
    borderRadius: '12px',
    fontSize: '0.8em',
    background: 'linear-gradient(45deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)',
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#6a0dad',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
    marginRight: '10px',
  },
};

export default KeywordTable;