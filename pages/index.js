import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import Filters from '../components/Filters';
import KeywordTable from '../components/KeywordTable';
import CategoryAnalysis from '../components/CategoryAnalysis';
import BrandedAnalysis from '../components/BrandedAnalysis';
import CategoryDistribution from '../components/CategoryDistribution';
import CompetitorAnalysis from '../components/CompetitorAnalysis';
import Sidebar from '../components/Sidebar';
import DataLoader from '../components/DataLoader';

const ClientKeywordsAnalysis = () => {
  const [keywordData, setKeywordData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // State management
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [searchVolumeFilter, setSearchVolumeFilter] = useState(0);
  const [brandedFilter, setBrandedFilter] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [chartMetric, setChartMetric] = useState('searchVolume');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompetitors, setShowCompetitors] = useState(true);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [rankRange, setRankRange] = useState([1, 10]);
  const [competitorDataType, setCompetitorDataType] = useState('count');
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('keywordTable');
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleDataLoad = (data) => {
    setKeywordData(data);
    setDataLoaded(true);
    setIsLoading(false);
  };

  const filteredData = useMemo(() => {
    if (!keywordData.length) return [];

    return keywordData.filter(item => {
      const categoryMatch = categoryFilters.length === 0 || categoryFilters.includes(item.category);
      const volumeMatch = item.searchVolume >= searchVolumeFilter;
      const brandedMatch = !brandedFilter || item.isBranded;
      const keywordMatch = keywordFilter === '' || 
        keywordFilter.split(',').some(keyword => 
          item.keyword.toLowerCase().includes(keyword.trim().toLowerCase())
        );
      const competitorMatch = item.competitors.some(comp => 
        (selectedCompetitors.length === 0 || selectedCompetitors.includes(comp.name)) &&
        comp.rank >= rankRange[0] && comp.rank <= rankRange[1]
      );

      return categoryMatch && volumeMatch && brandedMatch && keywordMatch && competitorMatch;
    });
  }, [keywordData, categoryFilters, searchVolumeFilter, brandedFilter, keywordFilter, selectedCompetitors, rankRange]);

  const handleKeywordSelect = useCallback((keyword) => {
    setSelectedKeywords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 text-gray-800 font-sans">
      <Head>
        <title>Content Gap Analysis Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        activeView={activeView} 
        setActiveView={setActiveView}
        categories={[...new Set(keywordData.map(item => item?.category || ''))]}
        competitors={[...new Set(keywordData.flatMap(item => 
          item?.competitors?.map(comp => comp?.name) || []
        ))]}
        categoryFilters={categoryFilters}
        setCategoryFilters={setCategoryFilters}
        selectedCompetitors={selectedCompetitors}
        setSelectedCompetitors={setSelectedCompetitors}
      />
      
      <div className="ml-0 transition-all duration-300 ease-in-out">
        <button 
          onClick={toggleSidebar} 
          className={`fixed left-5 z-50 bg-purple-700 text-white border-none rounded p-3 text-xl cursor-pointer transition-all duration-300 ease-in-out ${
            scrollPosition > 64 ? 'top-5' : 'top-20'
          }`}
        >
          ☰
        </button>

        <h1 className="text-4xl font-bold text-center text-purple-700 pb-5 mb-10 border-b-2 border-purple-700">
          Content Gap Analysis Dashboard
        </h1>

        <DataLoader 
          onDataLoad={handleDataLoad}
          isLoading={isLoading}
        />

        {/* Only render Filters and content when data is loaded */}
        {dataLoaded && (
          <>
            <Filters
              data={keywordData}
              categoryFilters={categoryFilters}
              setCategoryFilters={setCategoryFilters}
              searchVolumeFilter={searchVolumeFilter}
              setSearchVolumeFilter={setSearchVolumeFilter}
              brandedFilter={brandedFilter}
              setBrandedFilter={setBrandedFilter}
              keywordFilter={keywordFilter}
              setKeywordFilter={setKeywordFilter}
              showCompetitors={showCompetitors}
              setShowCompetitors={setShowCompetitors}
              selectedCompetitors={selectedCompetitors}
              setSelectedCompetitors={setSelectedCompetitors}
              rankRange={rankRange}
              setRankRange={setRankRange}
            />

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-700">Select View</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveView('keywordTable')}
                  className={`px-4 py-2 rounded ${activeView === 'keywordTable' ? 'bg-purple-700 text-white' : 'bg-gray-200'}`}
                >
                  Keyword Table
                </button>
                <button
                  onClick={() => setActiveView('categoryAnalysis')}
                  className={`px-4 py-2 rounded ${activeView === 'categoryAnalysis' ? 'bg-purple-700 text-white' : 'bg-gray-200'}`}
                >
                  Category Analysis
                </button>
                <button
                  onClick={() => setActiveView('competitorAnalysis')}
                  className={`px-4 py-2 rounded ${activeView === 'competitorAnalysis' ? 'bg-purple-700 text-white' : 'bg-gray-200'}`}
                >
                  Competitor Analysis
                </button>
              </div>
            </div>

            {activeView === 'keywordTable' && (
              <KeywordTable
                filteredData={filteredData}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                showCompetitors={showCompetitors}
                selectedKeywords={selectedKeywords}
                handleKeywordSelect={handleKeywordSelect}
              />
            )}

            {activeView === 'categoryAnalysis' && (
              <>
                <CategoryAnalysis
                  filteredData={filteredData}
                  chartMetric={chartMetric}
                  setChartMetric={setChartMetric}
                />
                <BrandedAnalysis
                  filteredData={filteredData}
                  chartMetric={chartMetric}
                />
                <CategoryDistribution
                  filteredData={filteredData}
                  chartMetric={chartMetric}
                />
              </>
            )}

            {activeView === 'competitorAnalysis' && (
              <CompetitorAnalysis
                filteredData={filteredData}
                competitorDataType={competitorDataType}
                setCompetitorDataType={setCompetitorDataType}
              />
            )}
          </>
        )}

        {!dataLoaded && (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl text-gray-700 mb-4">Welcome to the Content Gap Analysis Dashboard</h2>
            <p className="text-gray-600">Please enter a data URL above and click "Load Data" to begin.</p>
            <p className="text-gray-500 mt-2 text-sm">Example JSON format:</p>
            <pre className="bg-gray-100 p-4 rounded-lg mt-2 text-left overflow-x-auto">
              {JSON.stringify([
                {
                  "keyword": "example keyword",
                  "category": "category name",
                  "searchVolume": 1000,
                  "isBranded": false,
                  "competitors": [
                    {"name": "competitor.com", "rank": 1}
                  ]
                }
              ], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientKeywordsAnalysis;