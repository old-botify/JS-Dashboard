import React, { useState, useEffect } from 'react';

const DataLoader = ({ onDataLoad, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleLoad = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      
      // Handle JS module format
      let data;
      try {
        // Clean the text: remove export statement, semicolons, and any trailing commas
        const cleanedText = text
          .replace(/export\s+const\s+keywordData\s*=\s*/, '') // Remove export statement
          .replace(/;$/, '') // Remove trailing semicolon
          .replace(/,(\s*[\]}])/g, '$1') // Remove trailing commas
          .trim();

        // Parse the remaining JSON array
        try {
          data = JSON.parse(cleanedText);
        } catch (jsonError) {
          // If JSON parse fails, try eval with safety checks
          if (cleanedText.startsWith('[') && cleanedText.endsWith(']')) {
            // Use Function constructor instead of eval for better safety
            const safeEval = new Function('return ' + cleanedText);
            data = safeEval();
          } else {
            throw new Error('Data must be an array');
          }
        }
        
        if (Array.isArray(data)) {
          onDataLoad(data);
          setError('');
          localStorage.setItem('lastUsedDataUrl', url);
        } else {
          throw new Error('Data is not an array');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        console.error('First 100 chars of cleaned text:', cleanedText.substring(0, 100));
        setError(`Error parsing data: ${parseError.message}. Make sure the file contains a valid array of objects.`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Error loading data: ${err.message}`);
    }
  };

  // Load last used URL from localStorage
  useEffect(() => {
    const lastUrl = localStorage.getItem('lastUsedDataUrl');
    if (lastUrl) {
      setUrl(lastUrl);
    }
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter data URL (e.g., https://storage.googleapis.com/public-force-directed-json/db_brand_data.js)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleLoad}
          disabled={isLoading}
          className={`px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            'Load Data'
          )}
        </button>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Make sure your data file:
            <ul className="list-disc ml-5 mt-1">
              <li>Starts with 'export const keywordData = ['</li>
              <li>Contains a valid array of objects</li>
              <li>Each object has keyword, category, searchVolume, isBranded, and competitors properties</li>
            </ul>
          </p>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        <p>Expected format: JavaScript module exporting keywordData array</p>
        <p>File should contain: export const keywordData = [...]</p>
      </div>
    </div>
  );
};

export default DataLoader;