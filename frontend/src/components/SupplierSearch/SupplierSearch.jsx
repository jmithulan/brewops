import React, { useState } from 'react';
import './SupplierSearch.css';

export default function SupplierSearch() {
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('name');

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSearchType(e.target.value);
  };

  return (
    <div className="searchbar">
      <input
        type="text"
        placeholder={`Search ${searchType === 'id' ? 'Supplier ID' : 'Supplier Name'}`}
        value={searchInput}
        onChange={handleInputChange}
        
      />

      <select
        value={searchType}
        onChange={handleTypeChange}
       
      >
        <option value="name">Supplier Name</option>
        <option value="id">Supplier ID</option>
      </select>
    </div>
  );
}
