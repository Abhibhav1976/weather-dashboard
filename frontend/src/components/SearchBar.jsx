import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import weatherAPI from '../services/weatherApi';

const SearchBar = ({ onCitySelect, onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentWeatherSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 1) {
      setIsSearching(true);
      try {
        // Use real API to search cities
        const cities = await weatherAPI.searchCities(value);
        setSuggestions(cities);
        setShowSuggestions(true);
      } catch (error) {
        console.warn('City search failed:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleCitySelect = (city) => {
    const cityName = typeof city === 'string' ? city : city.name;
    setQuery(cityName);
    setShowSuggestions(false);
    
    // Add to recent searches
    const newRecent = [cityName, ...recentSearches.filter(s => s !== cityName)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentWeatherSearches', JSON.stringify(newRecent));
    
    onCitySelect(cityName);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleCitySelect(query.trim());
      onSearch(query.trim());
    }
  };

  const handleFocus = () => {
    if (query.length <= 1 && recentSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto" ref={suggestionsRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-hover:text-primary" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for a city..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            className="pl-10 pr-20 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-2 hover:border-primary/30"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 transition-all duration-200 hover:scale-105"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-64 overflow-y-auto shadow-xl border-2 animate-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {/* Loading state for search */}
            {isSearching && (
              <div className="px-3 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Searching cities...</span>
                </div>
              </div>
            )}

            {/* Recent searches */}
            {!isSearching && query.length <= 1 && recentSearches.length > 0 && (
              <>
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b flex items-center justify-between">
                  <span>Recent Searches</span>
                  <Badge variant="secondary" className="text-xs">
                    {recentSearches.length}
                  </Badge>
                </div>
                {recentSearches.map((city, index) => (
                  <button
                    key={`recent-${index}`}
                    className="w-full text-left px-3 py-3 hover:bg-accent rounded-md transition-colors duration-150 flex items-center gap-3 group"
                    onClick={() => handleCitySelect(city)}
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    <span className="font-medium truncate">{city}</span>
                  </button>
                ))}
              </>
            )}
            
            {/* API search suggestions */}
            {!isSearching && suggestions.length > 0 && (
              <>
                {query.length > 1 && recentSearches.length > 0 && (
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b flex items-center justify-between">
                    <span>Search Results</span>
                    <Badge variant="outline" className="text-xs">
                      {suggestions.length}
                    </Badge>
                  </div>
                )}
                {suggestions.map((city, index) => (
                  <button
                    key={`suggestion-${index}`}
                    className="w-full text-left px-3 py-3 hover:bg-accent rounded-md transition-colors duration-150 flex items-center gap-3 group"
                    onClick={() => handleCitySelect(city)}
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{city.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {city.region && city.region !== city.name && `${city.region}, `}
                        {city.country}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
            
            {/* No results */}
            {!isSearching && query.length > 1 && suggestions.length === 0 && (
              <div className="px-3 py-4 text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No cities found matching "{query}"</p>
                <p className="text-xs mt-1 opacity-75">Try a different spelling or location</p>
              </div>
            )}

            {/* Empty state for recent searches */}
            {!isSearching && query.length <= 1 && recentSearches.length === 0 && (
              <div className="px-3 py-4 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start typing to search cities</p>
                <p className="text-xs mt-1 opacity-75">Try "London", "Tokyo", or "New York"</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;