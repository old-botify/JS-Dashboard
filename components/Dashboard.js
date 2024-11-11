import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Select from 'react-select';
import Slider from 'rc-slider';
import KeywordTable from './KeywordTable';
import CategoryAnalysis from './CategoryAnalysis';
import QuestionsAnalysis from './BrandedAnalysis.js';
import CategoryDistribution from './CategoryDistribution';
import CompetitorAnalysis from './CompetitorAnalysis';

const Dashboard = () => {
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
  const [activeView, setActiveView] = useState('keywordTable');

  const filteredData = useMemo(() => {
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

      return categoryMatch && volumeMatch && questionMatch && keywordMatch && competitorMatch;
    });
  }, [categoryFilters, searchVolumeFilter, questionFilter, keywordFilter, selectedCompetitors, rankRange]);

  const categories = useMemo(() => [...new Set(keywordData.map(item => item.category))], []);

  const competitors = useMemo(() => {
    const allCompetitors = new Set();
    keywordData.forEach(item => {
      item.competitors.forEach(comp => {
        allCompetitors.add(comp.name);
      });
    });
    return Array.from(allCompetitors);
  }, []);

  const competitorOptions = useMemo(() => 
    competitors.map(comp => ({ value: comp, label: comp }))
  , [competitors]);

  const handleCategoryChange = useCallback((event) => {
    const value = event.target.value;
    setCategoryFilters(prev => {
      if (prev.includes(value)) {
        return prev.filter(cat => cat !== value);
      } else {
        return [...prev, value];
      }
    });
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 text-gray-800">
      <h1 className="text-4xl font-bold text-center text-purple-700 pb-5 mb-10 border-b-2 border-purple-700">Content Gap Analysis Dashboard</h1>
      
      <div className="bg-white rounded-lg p-8 mb-10 shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-purple-700">Filters</h2>
        <div className="flex flex-wrap gap-8">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-semibold">Categories</label>
            <div className="max-h-48 overflow-y-auto p-3 border border-gray-300 rounded-lg">
              {categories.map(category => (
                <label key={category} className="block mb-2 text-sm">
                  <input
                    type="checkbox"
                    value={category}
                    checked={categoryFilters.includes(category)}
                    onChange={handleCategoryChange}
                    className="mr-2 accent-purple-700"
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search-volume-filter" className="block mb-2 font-semibold">Minimum Search Volume</label>
            <input
              id="search-volume-filter"
              type="number"
              value={searchVolumeFilter}
              onChange={(e) => setSearchVolumeFilter(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="flex items-center mb-2 font-semibold">
              <input
                type="checkbox"
                checked={questionFilter}
                onChange={(e) => setQuestionFilter(e.target.checked)}
                className="mr-2 accent-purple-700"
              />
              Questions Only
            </label>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="keyword-filter" className="block mb-2 font-semibold">Keyword Filter</label>
            <input
              id="keyword-filter"
              type="text"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              placeholder="e.g., keyword one, keyword two"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="flex items-center mb-2 font-semibold">
              <input
                type="checkbox"
                checked={showCompetitors}
                onChange={(e) => setShowCompetitors(e.target.checked)}
                className="mr-2 accent-purple-700"
              />
              Show Competitors
            </label>
          </div>

          {showCompetitors && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="block mb-2 font-semibold">Select Competitors</label>
                <Select
                  isMulti
                  options={competitorOptions}
                  value={selectedCompetitors.map(comp => ({ value: comp, label: comp }))}
                  onChange={(selected) => setSelectedCompetitors(selected.map(option => option.value))}
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block mb-2 font-semibold">Rank Range</label>
                <Slider
                  range
                  min={1}
                  max={50}
                  defaultValue={rankRange}
                  onChange={setRankRange}
                  className="w-full mt-3"
                />
                <div className="mt-2">
                  Showing ranks {rankRange[0]} to {rankRange[1]}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">Select View</h2>
        <div className="flex space-x-4">
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
          <QuestionsAnalysis
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
    </div>
  );
};

export default Dashboard;