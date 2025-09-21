import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


import Spinner from '../components/Spinner';
import { inventoryService } from '../services/inventoryService';
import NavigationBar from '../components/navigationBar';
import Footer from '../components/Footer';
import { FaBoxOpen, FaEdit, FaPlusCircle } from 'react-icons/fa';

const CreateInventory = () => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [quantityError, setQuantityError] = useState('');
  const [createdInventoryId, setCreatedInventoryId] = useState('');
  const [preGeneratedInventoryId, setPreGeneratedInventoryId] = useState('');
  const navigate = useNavigate();
  const quantityRef = useRef(null);

  useEffect(() => {
    // pre-generate inventory id in format INV-YYYYMMDD-HHMM using local time
    const pad = (n) => n.toString().padStart(2, '0');
    const now = new Date();
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const generated = `INV-${year}${month}${day}-${hours}${minutes}`;
    setPreGeneratedInventoryId(generated);
  }, []);

  useEffect(() => {
    // focus the quantity input when modal finishes loading
    if (!loading) {
      setTimeout(() => {
        quantityRef.current?.focus();
      }, 0);
    }
  }, [loading]);

  const handleSaveInventory = async () => {
    if (quantityError || !quantity) {
      toast.error('Please fill all fields correctly');
      return;
    }
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    const data = {
      inventoryid: preGeneratedInventoryId,
      quantity: parseInt(quantity),
    };
    setLoading(true);
    try {
      const response = await inventoryService.createInventory(data);
      setLoading(false);
      if (response && response.inventory && response.inventory.inventoryid) {
        setCreatedInventoryId(response.inventory.inventoryid);
        toast.success(`Inventory created successfully! ID: ${response.inventory.inventoryid}`);
      } else {
        toast.success('Inventory created successfully!');
      }
      setTimeout(() => navigate('/inventory'), 1000);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to create inventory.');
    }
  };

  useEffect(() => {
    // Real-time validation for quantity
    if (quantity.length > 6) {
      setQuantityError('Quantity must not exceed 6 digits');
    } else if (quantity && parseInt(quantity) <= 0) {
      setQuantityError('Quantity must be greater than 0');
    } else {
      setQuantityError('');
    }
  }, [quantity]);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value.length <= 6) {
      setQuantity(value);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700 h-screen p-6 space-y-4 sticky top-0 text-white">
          <button onClick={() => navigate('/inventory')} className="flex items-center space-x-2 p-3 rounded-lg bg-green-600 bg-opacity-40 text-base font-medium w-full mb-2">
            <FaBoxOpen className="text-lg" />
            <span>Inventory Management</span>
          </button>
          <button onClick={() => navigate('/ProductionManagerDashboard')} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-700 text-base font-medium w-full">
            <FaEdit className="text-lg" />
            <span>Dashboard</span>
          </button>
          <button onClick={() => navigate('/Production')} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-700 text-base font-medium w-full">
            <FaEdit className="text-lg" />
            <span>Production</span>
          </button>
          <button disabled className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700 text-base font-medium w-full cursor-not-allowed opacity-60">
            <FaPlusCircle className="text-lg" />
            <span>Add Inventory</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto bg-white min-h-screen flex items-center justify-center">
          <div className="w-full max-w-xl flex flex-col items-center justify-center">
            <div className="w-full bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Create Inventory</h1>
              {loading && <Spinner />}
              {!loading && (
                <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSaveInventory(); }}>
                  <div>
                    <label className="block text-md mb-2 text-gray-700">Inventory Number</label>
                    <input
                      type="text"
                      value={createdInventoryId || preGeneratedInventoryId || ''}
                      placeholder={createdInventoryId || preGeneratedInventoryId ? '' : 'Will be generated by server (INV-YYYYMMDD-HHMM)'}
                      disabled
                      className="border border-gray-300 bg-gray-100 text-gray-700 px-4 py-2 w-full rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">Inventory ID is auto-generated by the server.</p>
                  </div>

                  <div>
                    <label className="block text-md mb-2 text-gray-700">Quantity (kg)</label>
                    <input
                      type="number"
                      ref={quantityRef}
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max="999999"
                      placeholder="Enter quantity in kilograms"
                      className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-blue-300 ${quantityError && 'border-red-500'}`}
                    />
                    {quantityError && <div className="text-red-500 text-sm mt-1">{quantityError}</div>}
                    <p className="text-sm text-gray-500 mt-1">* Enter the quantity of raw leaves in kilograms (max 6 digits)</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit" onClick={() => handleSaveInventory()}
                      className="py-2 px-6 bg-green-600 text-white rounded-md hover:bg-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || quantityError || !quantity}
                    >
                      {loading ? 'Saving...' : 'Save Inventory'}
                    </button>

                    <button
                      type="button"
                      className="py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none"
                      onClick={() => navigate('/inventory')}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CreateInventory;