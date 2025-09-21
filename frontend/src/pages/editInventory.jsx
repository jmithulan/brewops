import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import Spinner from '../components/Spinner';
import { inventoryService } from '../services/inventoryService';
import NavigationBar from '../components/navigationBar';
import Footer from '../components/Footer';
import { FaBoxOpen, FaEdit, FaPlusCircle } from 'react-icons/fa';

const EditInventory = () => {
  const [inventoryId, setInventoryId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const quantityRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    inventoryService.getInventoryById(id)
      .then((data) => {
        // Handle both { success, inventory } and direct inventory object
        let inv = null;
        if (data && data.success && data.inventory) {
          inv = data.inventory;
        } else if (data && data.inventoryid) {
          inv = data;
        }
        if (inv) {
          setInventoryId(inv.inventoryid);
          setQuantity(inv.quantity);
        } else {
          toast.error('Inventory not found.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error('Failed to fetch inventory.');
      });
  }, [id]);

  // focus the quantity input when the modal is displayed and loading has finished
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        quantityRef.current?.focus();
      }, 0);
    }
  }, [loading]);

  const handleUpdate = async () => {
    const updatedData = {
      inventoryid: inventoryId,
      quantity: parseInt(quantity),
    };
    setLoading(true);
    try {
        await inventoryService.updateInventory(id, updatedData);
        setLoading(false);
        // Use setTimeout to ensure loading spinner is cleared before navigation
        setTimeout(() => navigate('/inventory'), 10);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error('Failed to update inventory.');
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
          <button onClick={() => {}} disabled className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700 text-base font-medium w-full cursor-not-allowed opacity-60">
            <FaPlusCircle className="text-lg" />
            <span>Add Inventory</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto bg-white min-h-screen flex items-center justify-center">
          <div className="w-full max-w-xl flex flex-col items-center justify-center">
            <div className="w-full bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Edit Inventory</h1>
              {loading && <Spinner />}
              {!loading && (
                <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleUpdate(); }}>
                  <div>
                    <label htmlFor="inventoryId" className="block text-gray-700">Inventory ID</label>
                    <input
                      id="inventoryId"
                      type="text"
                      value={inventoryId}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      title="Inventory ID is auto-generated and cannot be changed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Inventory ID cannot be modified to maintain traceability
                    </p>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-gray-700">Quantity (kg)</label>
                    <input
                      id="quantity"
                      type="number"
                      ref={quantityRef}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-300"
                      min="1"
                      placeholder="Enter quantity in kilograms"
                    />
                  </div>

                  <div className='flex gap-4'>
                    <button
                      type="submit" onClick={handleUpdate} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-black transition duration-300"
                      
                    >
                      Save Changes
                    </button>
                      <button type="button" onClick={() => navigate('/inventory')} className='bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md'>Cancel</button>
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

export default EditInventory;