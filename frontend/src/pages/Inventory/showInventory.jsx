import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../../components/Spinner';

const ShowInventory = () => {
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      console.error('No ID provided for fetching inventory.');
      return;
    }

    setLoading(true);
    axios.get(`http://localhost:5000/inventory/${id}`) // Ensure correct ID is passed
      .then((response) => {
        setInventory(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching inventory:', error);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Modal backdrop */}
  <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50' onClick={() => navigate('/inventories')}>
        <div className="mt-6 bg-white p-8 rounded-lg shadow-md max-w-xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          {loading ? (
            <Spinner />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowInventory;
