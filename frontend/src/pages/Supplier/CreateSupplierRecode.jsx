import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from '../../components/Spinner';
import toast, { Toaster } from 'react-hot-toast';

const CreateSupplierRecode = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ratePerKg, setRatePerKg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("monthly");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryId, setDeliveryId] = useState('');
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore body scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const res = await axios.get('http://localhost:5000/api/suppliers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          setSuppliers(res.data.data);
          setFilteredSuppliers(res.data.data);
        } else {
          // Mock suppliers as fallback
          const mockSuppliers = [
            { _id: '1', id: '1', name: 'Kamal Perera', supplier_id: 'SUP00001', rate: 150 },
            { _id: '2', id: '2', name: 'Nimal Silva', supplier_id: 'SUP00002', rate: 145 }
          ];
          setSuppliers(mockSuppliers);
          setFilteredSuppliers(mockSuppliers);
        }
      } catch (error) {
        // Mock suppliers as fallback
        const mockSuppliers = [
          { _id: '1', id: '1', name: 'Kamal Perera', supplier_id: 'SUP00001', rate: 150 },
          { _id: '2', id: '2', name: 'Nimal Silva', supplier_id: 'SUP00002', rate: 145 }
        ];
        setSuppliers(mockSuppliers);
        setFilteredSuppliers(mockSuppliers);
      }
    };

    const generateDeliveryId = () => {
      // Generate a random 4-digit number for the delivery ID
      const randomId = Math.floor(Math.random() * 9000) + 1000;
      setDeliveryId(`DEL-${randomId.toString().padStart(4, '0')}`);
    };

    fetchSuppliers();
    generateDeliveryId();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      const supplier = suppliers.find(s => (s._id || s.id).toString() === selectedSupplier);
      if (supplier && supplier.rate) {
        setRatePerKg(supplier.rate.toString());
      }
    }
  }, [selectedSupplier, suppliers]);

  // Filter suppliers based on search input
  useEffect(() => {
    if (!supplierSearch) {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        supplier.supplier_id.toLowerCase().includes(supplierSearch.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    }
  }, [supplierSearch, suppliers]);

  // Validation functions
  const validateSupplier = (value) => {
    if (!value) return 'Supplier is required';
    return '';
  };
  const validateQuantity = (value) => {
    if (!value || isNaN(value) || Number(value) <= 0) return 'Quantity must be greater than 0';
    return '';
  };
  const validateRatePerKg = (value) => {
    if (!value || isNaN(value) || Number(value) <= 0) return 'Rate per kg must be greater than 0';
    return '';
  };
  const validateDeliveryDate = (value) => {
    if (!value) return 'Delivery date is required';
    return '';
  };

  const handleInputChange = (e, validator) => {
    const { name, value } = e.target;
    const error = validator(value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const validate = () => {
    const newErrors = {
      selectedSupplier: validateSupplier(selectedSupplier),
      quantity: validateQuantity(quantity),
      ratePerKg: validateRatePerKg(ratePerKg),
      deliveryDate: validateDeliveryDate(deliveryDate)
    };
    setErrors(newErrors);
    return Object.keys(newErrors).every(key => newErrors[key] === '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const data = {
      supplier_id: selectedSupplier,
      quantity: parseFloat(quantity),
      rate_per_kg: parseFloat(ratePerKg),
      payment_method: paymentMethod,
      delivery_date: deliveryDate,
      notes: notes,
      total_amount: parseFloat(quantity) * parseFloat(ratePerKg)
    };
    
    setLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const res = await axios.post('http://localhost:5000/api/deliveries', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        toast.success("Delivery record saved successfully!");
        
        // If spot payment, redirect to payment page
        if (paymentMethod === 'spot') {
          setTimeout(() => {
            navigate(`/suppliers/payments?recordId=${res.data.data.id}&amount=${data.total_amount}&supplier=${selectedSupplier}`, { 
              state: { recordData: res.data.data } 
            });
          }, 1000);
        } else {
          // Navigate back to SupplierRecode after successful creation
          setTimeout(() => {
            navigate('/SupplierRecode', { 
              state: { refresh: true, timestamp: Date.now(), message: 'Delivery record added successfully!' } 
            });
          }, 1000);
        }
      } else {
        toast.error(res.data?.message || 'Failed to save delivery record');
      }
    } catch (error) {
      toast.error('Error saving delivery record: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = quantity && ratePerKg ? (parseFloat(quantity) * parseFloat(ratePerKg)).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => navigate('/SupplierRecode')}>
      <Toaster position="top-center" />
      <div className='max-w-2xl w-full max-h-[90vh] bg-white rounded-lg shadow-md flex flex-col' onClick={e => e.stopPropagation()}>
        <div className='overflow-y-auto flex-1 p-8'>
          <h1 className='text-2xl my-2 text-center font-bold text-gray-800'>Add New Delivery Record</h1>
          {loading && <Spinner />}
          {!loading && (
            <form onSubmit={handleSave} className='space-y-4'>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Delivery ID</label>
                <input
                  type='text'
                  value={deliveryId}
                  readOnly
                  className='border border-gray-200 px-4 py-2 w-full rounded-md bg-gray-50 text-gray-600 font-mono'
                  placeholder='Auto-generated...'
                />
                <p className='text-xs text-gray-500 mt-1'>This ID is automatically generated for this delivery.</p>
              </div>

              <div>
                <label className='block text-md mb-2 text-gray-700'>Supplier</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search by supplier name or ID..."
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    className="border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300"
                  />
                  <select
                    name="selectedSupplier"
                    className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.selectedSupplier && 'border-red-500'}`}
                    value={selectedSupplier}
                    onChange={(e) => {
                      setSelectedSupplier(e.target.value);
                      handleInputChange(e, validateSupplier);
                    }}
                    disabled={loading}
                  >
                    <option value=''>Select Supplier</option>
                    {filteredSuppliers.map(s => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.name} ({s.supplier_id}) - Rate: Rs. {s.rate}/kg
                      </option>
                    ))}
                  </select>
                  {supplierSearch && filteredSuppliers.length === 0 && (
                    <p className="text-sm text-gray-500">No suppliers found matching your search.</p>
                  )}
                  {supplierSearch && filteredSuppliers.length > 0 && filteredSuppliers.length < suppliers.length && (
                    <p className="text-sm text-green-600">Showing {filteredSuppliers.length} of {suppliers.length} suppliers</p>
                  )}
                </div>
                {errors.selectedSupplier && <div className="text-red-500 text-sm mt-1">{errors.selectedSupplier}</div>}
              </div>

              <div>
                <label className='block text-md mb-2 text-gray-700'>Quantity (kg)</label>
                <input
                  type='number'
                  name="quantity"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    handleInputChange(e, validateQuantity);
                  }}
                  min='0.01'
                  step='0.01'
                  placeholder='Enter quantity in kilograms'
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.quantity && 'border-red-500'}`}
                  disabled={loading}
                />
                {errors.quantity && <div className="text-red-500 text-sm mt-1">{errors.quantity}</div>}
              </div>

              <div>
                <label className='block text-md mb-2 text-gray-700'>Rate Per Kg (Rs)</label>
                <input
                  type='number'
                  name="ratePerKg"
                  value={ratePerKg}
                  onChange={(e) => {
                    setRatePerKg(e.target.value);
                    handleInputChange(e, validateRatePerKg);
                  }}
                  min='0.01'
                  step='0.01'
                  placeholder='Rate per kg'
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.ratePerKg && 'border-red-500'}`}
                  disabled={loading}
                />
                {errors.ratePerKg && <div className="text-red-500 text-sm mt-1">{errors.ratePerKg}</div>}
                <p className='text-xs text-gray-500 mt-1'>Rate is automatically filled based on selected supplier.</p>
              </div>

              <div>
                <label className='block text-md mb-2 text-gray-700'>Delivery Date</label>
                <input
                  type='date'
                  name="deliveryDate"
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    handleInputChange(e, validateDeliveryDate);
                  }}
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.deliveryDate && 'border-red-500'}`}
                  disabled={loading}
                />
                {errors.deliveryDate && <div className="text-red-500 text-sm mt-1">{errors.deliveryDate}</div>}
              </div>

              <div>
                <label className='block text-md mb-2 text-gray-700'>Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'monthly' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('monthly')}
                  >
                    <input
                      type="radio"
                      id="monthly"
                      value="monthly"
                      checked={paymentMethod === 'monthly'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">📅</div>
                      <div className="font-medium text-gray-800">Monthly Payment</div>
                      <div className="text-sm text-gray-600">Pay at end of month</div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'spot' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod('spot')}
                  >
                    <input
                      type="radio"
                      id="spot"
                      value="spot"
                      checked={paymentMethod === 'spot'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">💰</div>
                      <div className="font-medium text-gray-800">Spot Payment</div>
                      <div className="text-sm text-gray-600">Pay immediately</div>
                    </div>
                  </div>
                </div>
                {paymentMethod === 'spot' && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> You will be redirected to the payment page after saving this record.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className='block text-md mb-2 text-gray-700'>Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Add any additional notes about this delivery..."
                  className="border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300"
                  disabled={loading}
                />
              </div>

              {quantity && ratePerKg && (
                <div className='p-4 bg-green-50 rounded-lg border border-green-200'>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-700'>Total Amount:</span>
                    <span className='text-lg font-bold text-green-600'>Rs. {totalAmount}</span>
                  </div>
                  <p className='text-sm text-gray-600 mt-1'>
                    {quantity} kg × Rs. {ratePerKg}/kg = Rs. {totalAmount}
                  </p>
                </div>
              )}

              <div className='flex gap-4'>
                <button
                  type='submit'
                  className='py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors'
                  disabled={loading}
                >
                  {loading ? 'Saving...' : paymentMethod === 'spot' ? 'Save & Pay Now' : 'Save Record'}
                </button>
                <button
                  type='button'
                  className='py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none font-medium transition-colors'
                  onClick={() => navigate('/SupplierRecode')}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSupplierRecode;