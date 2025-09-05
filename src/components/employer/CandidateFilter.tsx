'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/form-select';
import { FormInput } from '@/components/ui/form-input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface FilterOptions {
  fields: Array<{
    unit: number;
    description: string;
    major: number;
    major_label: string;
    sub_major: number;
    sub_major_label: string;
  }>;
  designations: Array<{
    id: number;
    name: string;
    isco_08_unit: number;
    isco_08_major: number;
    isco_08_major_label: string;
  }>;
  qualifications: Array<{
    value: string;
    label: string;
  }>;
}

interface FilterCriteria {
  field: string;
  designation: string;
  salary_min: string;
  salary_max: string;
  years_of_experience: string;
  qualification: string;
}

interface CandidateFilterProps {
  readonly onFilter: (criteria: FilterCriteria) => void;
  readonly onClear: () => void;
  readonly loading?: boolean;
  readonly onFilterOptionsLoaded?: (options: FilterOptions) => void;
}

export function CandidateFilter({ onFilter, onClear, loading = false, onFilterOptionsLoaded }: Readonly<CandidateFilterProps>) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterCriteria>({
    field: '',
    designation: '',
    salary_min: '',
    salary_max: '',
    years_of_experience: '',
    qualification: ''
  });

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No access token found');
          setOptionsLoading(false);
          return;
        }

        const response = await fetch('/api/employer/candidates/filter-options', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('CandidateFilter loaded filter options:', data.data);
          setFilterOptions(data.data);
          // Notify parent component that filter options are loaded
          if (onFilterOptionsLoaded) {
            console.log('CandidateFilter calling onFilterOptionsLoaded with:', data.data);
            onFilterOptionsLoaded(data.data);
          }
        } else {
          console.error('Failed to fetch filter options');
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (field: keyof FilterCriteria, value: string) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: value
      };
      
      // If field is changed, reset designation to show all designations
      if (field === 'field') {
        newFilters.designation = '';
      }
      
      
      return newFilters;
    });
  };

  const handleApplyFilter = () => {
    // Validate that designation is selected
    if (!filters.designation) {
      return;
    }
    onFilter(filters);
  };

  const handleClearFilter = () => {
    setFilters({
      field: '',
      designation: '',
      salary_min: '',
      salary_max: '',
      years_of_experience: '',
      qualification: ''
    });
    onClear();
  };

  // Filter designations based on selected field
  const getFilteredDesignations = () => {
    if (!filterOptions || !filters.field) {
      return filterOptions?.designations || [];
    }
    
    const selectedFieldUnit = parseInt(filters.field);
    return filterOptions.designations.filter(designation => 
      designation.isco_08_unit === selectedFieldUnit
    );
  };

  if (optionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filter Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filterOptions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filter Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Failed to load filter options
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Filter Candidates
          <div className="text-sm font-normal text-gray-500">
            Find the right talent for your needs
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mandatory Field Notice */}
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            <strong>Note:</strong> Designation is mandatory to filter candidates. Other fields are optional.
          </p>
        </div>

        {/* Horizontal Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {/* Field (ISCO_08) */}
          <div className="xl:col-span-2">
            <SearchableSelect
              id="field-select"
              label="Field (Finance, IT, etc.)"
              value={filters.field}
              onChange={(value) => handleFilterChange('field', value)}
              placeholder="Type to search fields..."
              options={filterOptions.fields.map(field => ({
                value: field.unit.toString(),
                label: field.description
              }))}
              helperText="Start typing to search through available job fields"
            />
          </div>

          {/* Designation */}
          <div className="xl:col-span-2">
            <SearchableSelect
              id="designation-select"
              label="Designation *"
              value={filters.designation}
              onChange={(value) => handleFilterChange('designation', value)}
              placeholder={filters.field ? "Type to search designations..." : "Select field first"}
              options={getFilteredDesignations().map(designation => ({
                value: designation.id.toString(),
                label: designation.name
              }))}
              helperText={filters.field ? "Start typing to search through available designations" : "Please select a field first to see related designations"}
            />
          </div>

          {/* Years of Experience */}
          <div>
            <FormInput
              id="experience-input"
              type="number"
              placeholder="Years of experience"
              value={filters.years_of_experience}
              onChange={(e) => handleFilterChange('years_of_experience', e.target.value)}
              label="Years of Experience"
            />
          </div>

          {/* Qualification */}
          <div>
            <label htmlFor="qualification-select" className="block text-sm font-medium text-gray-700 mb-2">
              Qualification
            </label>
            <FormSelect
              id="qualification-select"
              value={filters.qualification}
              onChange={(e) => handleFilterChange('qualification', e.target.value)}
              placeholder="Select qualification"
              options={filterOptions.qualifications.map(qual => ({
                value: qual.value,
                label: qual.label
              }))}
            />
          </div>
        </div>

        {/* Salary Range Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-2">
            <label htmlFor="salary-range" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Salary Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                id="salary-min"
                type="number"
                placeholder="Minimum salary"
                value={filters.salary_min}
                onChange={(e) => handleFilterChange('salary_min', e.target.value)}
              />
              <FormInput
                id="salary-max"
                type="number"
                placeholder="Maximum salary"
                value={filters.salary_max}
                onChange={(e) => handleFilterChange('salary_max', e.target.value)}
              />
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t justify-end">
          <Button
            variant="outline"
            onClick={handleClearFilter}
            disabled={loading}
            className="flex-1 sm:flex-none order-2 sm:order-1"
          >
            Clear Filters
          </Button>
          <Button
            onClick={handleApplyFilter}
            disabled={loading || !filters.designation}
            className="flex-1 sm:flex-none order-1 border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm py-2 sm:py-3 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Searching...
              </>
            ) : (
              'Search Candidates'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
