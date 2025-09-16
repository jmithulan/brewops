import React, { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const DeleteInventory = () => {
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch inventory details
  useEffect(() => {
    setLoading(true);
    
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/inventory/${id}`);
        setInventory(res.data.data);
      } catch (error) {
        console.error('Error fetching inventory details:', error);
  toast.error('Failed to load inventory details.');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [id]);

  const handleDeleteInventory = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/inventory/${id}`);
      navigate('/inventories'); 
    } catch (error) {
      console.error(error);
  toast.error('There was an error deleting the inventory. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-middle" />
      {/* Modal backdrop */}
  <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50' onClick={() => navigate('/inventories')}>
        <div className="mt-6 bg-white p-8 rounded-lg shadow-md max-w-xl w-full mx-4" onClick={(e) => e.stopPropagation()}>

          {loading && <Spinner />}

          {!loading && inventory && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-gray-800">Delete Inventory</h1>

              <div className="text-center w-full mb-4 text-md space-y-2">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="mb-2">
                    <strong className="text-gray-700">Inventory ID:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">{inventory.inventoryid}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Quantity:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">{inventory.quantity} kg</span>
                  </p>
                  {inventory.createdAt && (
                    <p className="mb-2">
                      <strong className="text-gray-700">Date Created:</strong> 
                      <span className="text-gray-600 ml-2">
                        {new Date(inventory.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 w-full">
                <p className="text-center text-red-600 font-semibold">
                   Warning: This action cannot be undone
                </p>
                <p className="text-center text-gray-700 mt-2">
                  Are you sure you want to permanently delete this inventory item?
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDeleteInventory}
                  disabled={loading}
                  className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                
                <button
                  onClick={() => navigate('/inventories')}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default DeleteInventory;