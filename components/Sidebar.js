import React, { useEffect, useState, useRef } from 'react';
import { FaTable, FaChartBar, FaUsers, FaFilter, FaTags, FaChevronRight } from 'react-icons/fa';

const Sidebar = ({ 
  isOpen, 
  toggleSidebar, 
  activeView, 
  setActiveView,
  categories = [],
  competitors = [],
  categoryFilters,
  setCategoryFilters,
  selectedCompetitors,
  setSelectedCompetitors
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        toggleSidebar();
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleSidebar]);

  const handleMenuItemClick = (view) => {
    setActiveView(view);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCategoryToggle = (category) => {
    setCategoryFilters(prev => {
      const newFilters = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      return newFilters;
    });
  };

  const handleCompetitorToggle = (competitor) => {
    setSelectedCompetitors(prev => {
      const newSelection = prev.includes(competitor)
        ? prev.filter(c => c !== competitor)
        : [...prev, competitor];
      return newSelection;
    });
  };

  const sidebarStyle = {
    ...styles.sidebar,
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    top: scrollPosition > 64 ? '0px' : '64px',
  };

  return (
    <div style={sidebarStyle} ref={sidebarRef}>
      <div style={styles.header}>
        <h2 style={styles.title}>Dashboard</h2>
        <button onClick={toggleSidebar} style={styles.closeButton}>×</button>
      </div>

      <div style={styles.menuItems}>
        {/* Main Views */}
        <div style={styles.section}>
          <button 
            onClick={() => handleMenuItemClick('keywordTable')}
            style={{
              ...styles.menuItem,
              backgroundColor: activeView === 'keywordTable' ? '#6a0dad' : 'transparent',
              color: activeView === 'keywordTable' ? 'white' : '#333'
            }}
          >
            <FaTable style={styles.icon} /> Keyword Table
          </button>
          <button 
            onClick={() => handleMenuItemClick('categoryAnalysis')}
            style={{
              ...styles.menuItem,
              backgroundColor: activeView === 'categoryAnalysis' ? '#6a0dad' : 'transparent',
              color: activeView === 'categoryAnalysis' ? 'white' : '#333'
            }}
          >
            <FaChartBar style={styles.icon} /> Category Analysis
          </button>
          <button 
            onClick={() => handleMenuItemClick('competitorAnalysis')}
            style={{
              ...styles.menuItem,
              backgroundColor: activeView === 'competitorAnalysis' ? '#6a0dad' : 'transparent',
              color: activeView === 'competitorAnalysis' ? 'white' : '#333'
            }}
          >
            <FaUsers style={styles.icon} /> Competitor Analysis
          </button>
        </div>

        {/* Categories Section */}
        <div style={styles.section}>
          <button 
            onClick={() => toggleSection('categories')}
            style={styles.sectionHeader}
          >
            <FaTags style={styles.icon} />
            Categories
            <FaChevronRight style={{
              ...styles.chevron,
              transform: expandedSection === 'categories' ? 'rotate(90deg)' : 'none'
            }} />
          </button>
          {expandedSection === 'categories' && (
            <div style={styles.filterList}>
              {categories.map(category => (
                <label key={category} style={styles.filterItem}>
                  <input
                    type="checkbox"
                    checked={categoryFilters.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    style={styles.checkbox}
                  />
                  <span style={styles.filterLabel}>{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Competitors Section */}
        <div style={styles.section}>
          <button 
            onClick={() => toggleSection('competitors')}
            style={styles.sectionHeader}
          >
            <FaUsers style={styles.icon} />
            Competitors
            <FaChevronRight style={{
              ...styles.chevron,
              transform: expandedSection === 'competitors' ? 'rotate(90deg)' : 'none'
            }} />
          </button>
          {expandedSection === 'competitors' && (
            <div style={styles.filterList}>
              {competitors.map(competitor => (
                <label key={competitor} style={styles.filterItem}>
                  <input
                    type="checkbox"
                    checked={selectedCompetitors.includes(competitor)}
                    onChange={() => handleCompetitorToggle(competitor)}
                    style={styles.checkbox}
                  />
                  <span style={styles.filterLabel}>{competitor}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '280px',
    backgroundColor: '#f8f9fa',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out, top 0.3s ease-in-out',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
  },
  menuItems: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    overflowY: 'auto',
  },
  section: {
    marginBottom: '20px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#333',
    fontWeight: '500',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '0',
    textAlign: 'left',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    marginBottom: '2px',
  },
  icon: {
    marginRight: '10px',
    fontSize: '16px',
  },
  chevron: {
    marginLeft: 'auto',
    fontSize: '12px',
    transition: 'transform 0.3s ease',
  },
  filterList: {
    padding: '10px 0',
  },
  filterItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 20px 8px 40px',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '10px',
    cursor: 'pointer',
  },
  filterLabel: {
    fontSize: '0.9rem',
    color: '#444',
  },
};

export default Sidebar;