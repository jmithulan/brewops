import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import Spinner from '../components/Spinner';
import Footer from '../components/Footer';
import { FaBoxOpen, FaEdit, FaPlusCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';


const ShowInventory = () => {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError('No ID provided for fetching inventory.');
      return;
    }
    setLoading(true);
    setError('');
    inventoryService.getInventoryById(id)
      .then((data) => {
        // Handle both { success, inventory } and direct inventory object
        if (data && data.success && data.inventory) {
          setInventory(data.inventory);
        } else if (data && data.inventoryid) {
          setInventory(data);
        } else {
          setInventory(null);
          setError('Inventory not found.');
        }
        setLoading(false);
      })
      .catch((error) => {
        setError('Error fetching inventory.');
        setLoading(false);
      });
  }, [id]);


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
              {loading ? (
                <Spinner />
              ) : error ? (
                <div className="text-red-600 text-center font-semibold py-8">{error}</div>
              ) : inventory ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Inventory Details</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Inventory ID:</span>
                      <span className="text-gray-900 font-mono font-bold">{inventory.inventoryid}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Quantity:</span>
                      <span className="text-gray-900 font-semibold">{inventory.quantity} kg</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Created At:</span>
                      <span className="text-gray-900">{inventory.createdAt ? new Date(inventory.createdAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-700">Updated At:</span>
                      <span className="text-gray-900">{inventory.updatedAt ? new Date(inventory.updatedAt).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ShowInventory;
