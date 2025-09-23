import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const EditInventory = () => {
  const [inventoryId, setInventoryId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const quantityRef = useRef(null);

  useEffect(() => {
    setLoading(true);

     axios.get(`http://localhost:5000/inventory/${id}`)
      .then((res) => {
        const data = res.data.data; // Use data.data from backend response
        setInventoryId(data.inventoryid);
        setQuantity(data.quantity);
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

  const handleUpdate = () => {
    const updatedData = {
      inventoryid: inventoryId,
      quantity: parseInt(quantity),
    };
    setLoading(true);
    axios.put(`http://localhost:5000/inventory/${id}`, updatedData)
      .then(() => {
        setLoading(false);
        navigate('/inventories');
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error('Failed to update inventory.');
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Modal backdrop */}
      <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50' onClick={() => navigate('/Inventories')}>
        <div className='max-w-2xl w-full mx-4 bg-white p-6 rounded-lg shadow-md' onClick={(e) => e.stopPropagation()}>
          <h1 className="text-center text-2xl font-bold mb-6 text-gray-800">Edit Inventory</h1>

          {loading && <Spinner />}

          {!loading && (
            <div className="space-y-4">
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
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-black transition duration-300"
                >
                  Save Changes
                </button>
                <button onClick={() => navigate('/Inventories')} className='bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md'>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default EditInventory;