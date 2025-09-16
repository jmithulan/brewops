import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

export default function DeleteSupplyRecode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Record fetch
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    axios
      .get(`http://localhost:5000/api/deliveries/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        if (res.data && res.data.success) {
          setRecord(res.data.data);
        } else {
          // Mock data as fallback
          const mockRecord = {
            id: id,
            _id: id,
            record_id: `DEL-${id.toString().padStart(4, '0')}`,
            supplier_name: 'Green Tea Supplies',
            supplier_id: 'SUP-001',
            quantity: 25.5,
            rate_per_kg: 150,
            total_amount: 3825,
            payment_method: 'monthly',
            payment_status: 'pending',
            delivery_date: '2024-12-07',
            notes: 'Good quality tea leaves',
          };
          setRecord(mockRecord);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching supply record:", err);
        toast.error("Failed to load supply record details");
        // Mock data as fallback
        const mockRecord = {
          id: id,
          _id: id,
          record_id: `DEL-${id.toString().padStart(4, '0')}`,
          supplier_name: 'Green Tea Supplies',
          supplier_id: 'SUP-001',
          quantity: 25.5,
          rate_per_kg: 150,
          total_amount: 3825,
          payment_method: 'monthly',
          payment_status: 'pending',
          delivery_date: '2024-12-07',
          notes: 'Good quality tea leaves',
        };
        setRecord(mockRecord);
        setLoading(false);
      });
  }, [id]);

  // Delete confirm button
  const handleDelete = () => {
    const token = localStorage.getItem('jwtToken');
    
    setLoading(true);
    
    axios
      .delete(`http://localhost:5000/api/deliveries/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        toast.success("Supply record deleted successfully");
        setLoading(false);
        
        // Pass state to trigger refresh in SupplierRecode with timestamp
        navigate("/SupplierRecode", { 
          state: { refresh: true, timestamp: Date.now() },
          replace: true 
        });
      })
      .catch((err) => {
        setLoading(false);
        
        // More specific error messages
        if (err.response?.status === 500) {
          toast.error("Server error occurred. Please try again.");
        } else if (err.response?.status === 401) {
          toast.error("Authentication failed. Please login again.");
        } else if (err.response?.status === 404) {
          toast.error("Supply record not found.");
        } else if (err.response?.status === 403) {
          toast.error("You don't have permission to delete this record.");
        } else {
          toast.error(`Failed to delete supply record: ${err.response?.data?.message || err.message}`);
        }
      });
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page (SupplierRecode)
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => navigate('/SupplierRecode')}>
      <div className='max-w-xl w-full max-h-[90vh] bg-white rounded-lg shadow-md flex flex-col' onClick={e => e.stopPropagation()}>
        <div className='overflow-y-auto flex-1 p-8'>
          <h1 className='text-2xl my-4 text-center font-bold text-gray-800'>Delete Supply Record</h1>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : record ? (
            <>
              {/* Record Details */}
              <div className="text-center w-full mb-4 text-md space-y-2">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="mb-2">
                    <strong className="text-gray-700">Record ID:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">
                      {record.record_id || `DEL-${(record.id || record._id).toString().padStart(4, '0')}`}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Supplier Name:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">
                      {record.supplier_name || record.supplier?.name || 'N/A'}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Supplier ID:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">
                      {record.supplier_id || record.supplier?.supplier_id || 'N/A'}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Quantity:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">
                      {parseFloat(record.quantity) || 0} kg
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Rate per kg:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">
                      LKR {parseFloat(record.rate_per_kg) || 0}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Total Amount:</strong> 
                    <span className="text-green-600 font-semibold ml-2">
                      LKR {record.total_amount || ((parseFloat(record.quantity) || 0) * (parseFloat(record.rate_per_kg) || 0)).toFixed(2)}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Payment Method:</strong> 
                    <span className="text-gray-900 font-semibold ml-2 capitalize">
                      {record.payment_method || 'N/A'}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Delivery Date:</strong> 
                    <span className="text-gray-900 ml-2">
                      {record.delivery_date ? new Date(record.delivery_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </p>
                  {record.notes && (
                    <p className="mb-2">
                      <strong className="text-gray-700">Notes:</strong> 
                      <span className="text-gray-900 ml-2">
                        {record.notes}
                      </span>
                    </p>
                  )}
                  {record.created_at && (
                    <p className="mb-2">
                      <strong className="text-gray-700">Date Created:</strong> 
                      <span className="text-gray-600 ml-2">
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 w-full">
                <p className="text-center text-red-600 font-semibold">
                   Warning: This action cannot be undone
                </p>
                <p className="text-center text-gray-700 mt-2">
                  Are you sure you want to permanently delete this supply record and all associated data?
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => navigate('/SupplierRecode')}
                  className="flex-1 py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg mb-2">Supply record not found.</p>
              <p className="text-gray-600 mb-4">The supply record with ID {id} could not be retrieved.</p>
              <button
                onClick={() => navigate('/SupplierRecode')}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none font-medium"
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
