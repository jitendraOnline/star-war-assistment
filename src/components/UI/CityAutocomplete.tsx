import React, { useState, useRef, useEffect } from 'react';
import { useCitiesContext } from '@/contexts/CitiesContext';
import { addCity } from '@/features/city/city.service';

interface CityAutocompleteProps {
  value: string;
  onChange: (cityId: string, cityName: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Enter city name',
  required = false,
  className = '',
}) => {
  const { cities } = useCitiesContext();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find the city name for the current value
  useEffect(() => {
    const currentCity = cities.find((city) => city.id === value);
    if (currentCity) {
      setInputValue(currentCity.name);
    } else if (!value) {
      setInputValue('');
    }
  }, [value, cities]);

  // Filter cities based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredCities(cities);
      return;
    }

    const filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredCities(filtered);
    setHighlightedIndex(-1);
  }, [inputValue, cities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);

    // If the input matches an existing city exactly, select it
    const exactMatch = cities.find((city) => city.name.toLowerCase() === newValue.toLowerCase());

    if (exactMatch) {
      onChange(exactMatch.id, exactMatch.name);
    } else {
      // Clear the selection if no exact match
      onChange('', newValue);
    }
  };

  const handleCitySelect = (city: { id: string; name: string }) => {
    setInputValue(city.name);
    onChange(city.id, city.name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleCreateCity = async () => {
    if (!inputValue.trim() || isCreating) return;

    // Check if city already exists
    const existingCity = cities.find(
      (city) => city.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (existingCity) {
      handleCitySelect(existingCity);
      return;
    }

    setIsCreating(true);
    try {
      await addCity(inputValue.trim());
      // The new city will be added to the cities list via the context subscription
      // We'll wait a bit for it to appear and then select it
      setTimeout(() => {
        const newCity = cities.find(
          (city) => city.name.toLowerCase() === inputValue.trim().toLowerCase()
        );
        if (newCity) {
          handleCitySelect(newCity);
        }
        setIsCreating(false);
      }, 500);
    } catch (error) {
      console.error('Failed to create city:', error);
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredCities.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
          handleCitySelect(filteredCities[highlightedIndex]);
        } else if (inputValue.trim() && filteredCities.length === 0) {
          handleCreateCity();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleBlur = () => {
    // Delay closing to allow for click events on the dropdown
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  const shouldShowCreateOption =
    inputValue.trim() &&
    !cities.some((city) => city.name.toLowerCase() === inputValue.toLowerCase()) &&
    filteredCities.length === 0;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
        autoComplete="off"
      />

      {isOpen && (inputValue.length > 0 || filteredCities.length > 0) && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredCities.map((city, index) => (
            <li
              key={city.id}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleCitySelect(city)}
            >
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {city.name}
              </div>
            </li>
          ))}

          {shouldShowCreateOption && (
            <li
              className={`px-4 py-3 cursor-pointer transition-colors border-t border-gray-200 ${
                highlightedIndex === filteredCities.length
                  ? 'bg-green-100 text-green-900'
                  : 'hover:bg-green-50 text-green-700'
              }`}
              onClick={handleCreateCity}
            >
              <div className="flex items-center">
                {isCreating ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create "{inputValue}"
                  </>
                )}
              </div>
            </li>
          )}

          {inputValue.length > 0 && filteredCities.length === 0 && !shouldShowCreateOption && (
            <li className="px-4 py-3 text-gray-500 text-center">No cities found</li>
          )}
        </ul>
      )}
    </div>
  );
};
