import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/Spinner';

export default function ShowSupplyRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore body scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(`http://localhost:5000/api/deliveries/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.success) {
          setRecord(response.data.data);
        } else {
          console.error('Failed to fetch supply record:', response.data?.message);
          // Fallback to dummy data with correct field structure
          const dummyRecord = {
            id: id,
            record_id: `DEL-${id.toString().padStart(4, '0')}`,
            supplier_name: 'Green Tea Supplies',
            supplier_id: 'SUP-20250907-0001',
            quantity: 25.5,
            rate_per_kg: 150.00,
            total_amount: 3825.00,
            payment_method: 'monthly',
            payment_status: 'pending',
            delivery_date: '2024-12-07',
            notes: 'Good quality tea leaves delivered on time',
            created_at: '2025-08-01T10:00:00Z',
            updated_at: '2025-08-01T10:00:00Z',
          };
          setRecord(dummyRecord);
        }
      } catch (error) {
        console.error('Error fetching supply record:', error);
        // Fallback to dummy data with correct field structure
        const dummyRecord = {
          id: id,
          record_id: `DEL-${id.toString().padStart(4, '0')}`,
          supplier_name: 'Green Tea Supplies',
          supplier_id: 'SUP-20250907-0001',
          quantity: 25.5,
          rate_per_kg: 150.00,
          total_amount: 3825.00,
          payment_method: 'monthly',
          payment_status: 'pending',
          delivery_date: '2024-12-07',
          notes: 'Good quality tea leaves delivered on time',
          created_at: '2025-08-01T10:00:00Z',
          updated_at: '2025-08-01T10:00:00Z',
        };
        setRecord(dummyRecord);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecord();
    }
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => navigate('/SupplierRecode')}>
      <div className='max-w-4xl w-full max-h-[90vh] bg-white rounded-lg shadow-md flex flex-col' onClick={e => e.stopPropagation()}>
        <div className='overflow-y-auto flex-1 p-8'>
          <h1 className='text-3xl my-4 text-center font-bold text-gray-800'>Supply Record Details</h1>
          
          {loading ? (
            <Spinner />
          ) : record ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Record Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Record ID</label>
                    <p className="text-lg text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {record.record_id || `DEL-${record.id || record._id}` || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Delivery Date</label>
                    <p className="text-lg text-gray-900">
                      {record.delivery_date 
                        ? new Date(record.delivery_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Supplier Name</label>
                    <p className="text-lg text-gray-900">{record.supplier_name || record.supplier?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Supplier ID</label>
                    <p className="text-lg text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {record.supplier_id || record.supplier?.supplier_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Quantity (kg)</label>
                    <p className="text-lg text-gray-900 font-bold">
                      {record.quantity ? parseFloat(record.quantity).toFixed(2) : 'N/A'} kg
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Rate (LKR/kg)</label>
                    <p className="text-lg text-green-600 font-bold">
                      LKR {record.rate_per_kg ? parseFloat(record.rate_per_kg).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Payment Method</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      record.payment_method === 'spot' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {record.payment_method === 'spot' ? 'Spot Payment' : 'Monthly Payment'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Payment Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      record.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {record.notes && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Notes</label>
                      <p className="text-lg text-gray-900 bg-gray-100 p-3 rounded">
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Financial Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Total Amount</label>
                    <p className="text-2xl text-green-600 font-bold">
                      LKR {record.total_amount ? parseFloat(record.total_amount).toFixed(2) : 
                           (record.quantity && record.rate_per_kg ? 
                            (parseFloat(record.quantity) * parseFloat(record.rate_per_kg)).toFixed(2) : 'N/A')}
                    </p>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Created At</label>
                    <p className="text-lg text-gray-900">
                      {record.created_at 
                        ? new Date(record.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-lg text-gray-900">
                      {record.updated_at 
                        ? new Date(record.updated_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate('/SupplierRecode')}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate(`/supplyRecode/edit/${id}`, { state: { background: location } })}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Edit Record
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this supply record? This action cannot be undone.')) {
                      navigate(`/supplyRecode/delete/${id}`, { state: { background: location } });
                    }
                  }}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Delete Record
                </button>
                {record.payment_method === 'spot' && record.payment_status !== 'paid' && (
                  <button
                    onClick={() => navigate(`/suppliers/payments?recordId=${id}&amount=${record.total_amount}&supplier=${record.supplier_id}`)}
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    Process Payment
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg mb-2">Supply record not found.</p>
              <p className="text-gray-600 mb-4">The supply record with ID {id} could not be retrieved.</p>
              <button
                onClick={() => navigate('/SupplierRecode')}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Go Back to Supply Records
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
