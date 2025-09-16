import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

export default function DeleteSuppliers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Supplier fetch
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    axios
      .get(`http://localhost:5000/api/suppliers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        setSupplier(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching supplier:", err);
        toast.error("Failed to load supplier details");
        setLoading(false);
      });
  }, [id]);

  // Delete confirm button
  const handleDelete = () => {
    const token = localStorage.getItem('jwtToken');
    
    setLoading(true);
    
    axios
      .delete(`http://localhost:5000/api/suppliers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        toast.success("Supplier deleted successfully");
        setLoading(false);
        
        // Pass state to trigger refresh in SupplierHome with timestamp
        navigate("/SupplierHome", { 
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
          toast.error("Supplier not found.");
        } else if (err.response?.status === 403) {
          toast.error("You don't have permission to delete this supplier.");
        } else {
          toast.error(`Failed to delete supplier: ${err.response?.data?.message || err.message}`);
        }
      });
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page (SupplierHome)
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => navigate('/SupplierHome')}>
      <div className='max-w-xl w-full max-h-[90vh] bg-white rounded-lg shadow-md flex flex-col' onClick={e => e.stopPropagation()}>
        <div className='overflow-y-auto flex-1 p-8'>
          <h1 className='text-2xl my-4 text-center font-bold text-gray-800'>Delete Supplier</h1>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : supplier ? (
            <>
              {/* Supplier Details */}
              <div className="text-center w-full mb-4 text-md space-y-2">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="mb-2">
                    <strong className="text-gray-700">Supplier ID:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">
                      {supplier.data?.supplier_id || supplier.supplier_id || `ID-${supplier.id}` || 'N/A'}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Name:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">
                      {supplier.data?.name || supplier.name || 'N/A'}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Contact Number:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">
                      {supplier.data?.contact_number || supplier.contact_number || 'N/A'}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Rate:</strong> 
                    <span className="text-green-600 font-semibold ml-2">
                      LKR {supplier.data?.rate || supplier.rate || 'N/A'}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700">Address:</strong> 
                    <span className="text-gray-900 ml-2">
                      {supplier.data?.address || supplier.address || 'N/A'}
                    </span>
                  </p>
                  {(supplier.data?.created_at || supplier.created_at) && (
                    <p className="mb-2">
                      <strong className="text-gray-700">Date Created:</strong> 
                      <span className="text-gray-600 ml-2">
                        {new Date(supplier.data?.created_at || supplier.created_at).toLocaleDateString()}
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
                  Are you sure you want to permanently delete this supplier and all associated records?
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
                  onClick={() => navigate('/SupplierHome')}
                  className="flex-1 py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg mb-2">Supplier not found.</p>
              <p className="text-gray-600 mb-4">The supplier with ID {id} could not be retrieved.</p>
              <button
                onClick={() => navigate('/SupplierHome')}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none font-medium"
              >
                Go Back to Suppliers
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
