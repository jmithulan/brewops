import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import toast, { Toaster } from 'react-hot-toast';

export default function EditSupplierRecode() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [quantity, setQuantity] = useState('');
  const [ratePerKg, setRatePerKg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('monthly');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [recordId, setRecordId] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore body scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Validation functions
  const validateSupplier = (value) => {
    if (!value.trim()) return 'Supplier selection is required';
    return '';
  };
  const validateQuantity = (value) => {
    if (!value.trim()) return 'Quantity is required';
    if (isNaN(value) || Number(value) <= 0) return 'Quantity must be a positive number';
    return '';
  };
  const validateRate = (value) => {
    if (!value.trim()) return 'Rate is required';
    if (isNaN(value) || Number(value) <= 0) return 'Rate must be a positive number';
    return '';
  };
  const validateDeliveryDate = (value) => {
    if (!value.trim()) return 'Delivery date is required';
    return '';
  };

  const handleInputChange = (e, validator) => {
    const { name, value } = e.target;
    const error = validator(value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  // Fetch existing record data and suppliers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken');
        
        // Fetch suppliers
        const suppliersResponse = await axios.get('http://localhost:5000/api/suppliers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (suppliersResponse.data && suppliersResponse.data.success) {
          setSuppliers(suppliersResponse.data.data);
        } else {
          // Mock suppliers as fallback
          setSuppliers([
            { _id: '1', id: '1', name: 'Kamal Perera', supplier_id: 'SUP-001', rate: 150 },
            { _id: '2', id: '2', name: 'Nimal Silva', supplier_id: 'SUP-002', rate: 145 }
          ]);
        }
        
        // Fetch record to edit
        const recordResponse = await axios.get(`http://localhost:5000/api/deliveries/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (recordResponse.data && recordResponse.data.success) {
          const record = recordResponse.data.data;
          setRecordId(record.record_id || `DEL-${(record.id || record._id).toString().padStart(4, '0')}`);
          setSelectedSupplier(record.supplier_id || record.supplier?._id || '');
          setQuantity(record.quantity?.toString() || '');
          setRatePerKg(record.rate_per_kg?.toString() || '');
          setPaymentMethod(record.payment_method || 'monthly');
          setDeliveryDate(record.delivery_date ? new Date(record.delivery_date).toISOString().split('T')[0] : '');
          setNotes(record.notes || '');
        } else {
          // Mock data as fallback
          setRecordId(`DEL-${id.toString().padStart(4, '0')}`);
          setSelectedSupplier('1');
          setQuantity('25.5');
          setRatePerKg('150');
          setPaymentMethod('monthly');
          setDeliveryDate(new Date().toISOString().split('T')[0]);
          setNotes('Good quality tea leaves');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading record details');
        // Mock data as fallback
        setSuppliers([
          { _id: '1', id: '1', name: 'Kamal Perera', supplier_id: 'SUP-001', rate: 150 },
          { _id: '2', id: '2', name: 'Nimal Silva', supplier_id: 'SUP-002', rate: 145 }
        ]);
        setRecordId(`DEL-${id.toString().padStart(4, '0')}`);
        setSelectedSupplier('1');
        setQuantity('25.5');
        setRatePerKg('150');
        setPaymentMethod('monthly');
        setDeliveryDate(new Date().toISOString().split('T')[0]);
        setNotes('Good quality tea leaves');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleUpdateRecord = async () => {
    const newErrors = {
      selectedSupplier: validateSupplier(selectedSupplier),
      quantity: validateQuantity(quantity),
      ratePerKg: validateRate(ratePerKg),
      deliveryDate: validateDeliveryDate(deliveryDate),
    };
    setErrors(newErrors);
    const isValid = !Object.values(newErrors).some((err) => err !== '');
    if (!isValid) return;

    const data = {
      supplier_id: selectedSupplier,
      quantity: Number(quantity),
      rate_per_kg: Number(ratePerKg),
      payment_method: paymentMethod,
      delivery_date: deliveryDate,
      notes: notes,
      total_amount: Number(quantity) * Number(ratePerKg)
    };
    
    setLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      
      const res = await axios.put(`http://localhost:5000/api/deliveries/${id}`, data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data && res.data.success) {
        toast.success('Supply record updated successfully!');
        // Navigate back to SupplierRecode with refresh and timestamp
        setTimeout(() => {
          navigate('/SupplierRecode', { 
            state: { refresh: true, timestamp: Date.now(), message: 'Supply record updated successfully!' } 
          });
        }, 200);
      } else {
        toast.error(res.data?.message || 'Failed to update supply record');
      }
    } catch (err) {
      if (err.response?.status === 500) {
        toast.error('Server error occurred. Please try again.');
      } else if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (err.response?.status === 404) {
        toast.error('Supply record not found.');
      } else {
        toast.error('Error updating record: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = quantity && ratePerKg ? (Number(quantity) * Number(ratePerKg)).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => navigate('/SupplierRecode')}>
      <Toaster position="top-center" />
      <div className='max-w-2xl w-full max-h-[90vh] bg-white rounded-lg shadow-md flex flex-col' onClick={e => e.stopPropagation()}>
        <div className='overflow-y-auto flex-1 p-8'>
          <h1 className='text-2xl my-2 text-center font-bold text-gray-800'>Edit Supply Record</h1>
          {loading && <Spinner />}
          {!loading && (
            <form className='space-y-4' onSubmit={e => { e.preventDefault(); handleUpdateRecord(); }}>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Record ID</label>
                <input
                  type="text"
                  value={recordId}
                  disabled
                  className='border border-gray-300 bg-gray-100 text-gray-700 px-4 py-2 w-full rounded-md'
                />
                <p className='text-xs text-gray-500 mt-1'>Record ID cannot be changed.</p>
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Supplier</label>
                <select
                  name="selectedSupplier"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.selectedSupplier && 'border-red-500'}`}
                  value={selectedSupplier}
                  onChange={(e) => {
                    setSelectedSupplier(e.target.value);
                    handleInputChange(e, validateSupplier);
                  }}
                >
                  <option value=''>Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>
                      {supplier.name} ({supplier.supplier_id}) - Rate: LKR {supplier.rate}/kg
                    </option>
                  ))}
                </select>
                {errors.selectedSupplier && <div className="text-red-500 text-sm mt-1">{errors.selectedSupplier}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Quantity (kg)</label>
                <input
                  type="number"
                  name="quantity"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.quantity && 'border-red-500'}`}
                  placeholder="Enter quantity in kilograms"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    handleInputChange(e, validateQuantity);
                  }}
                  min="0.01"
                  step="0.01"
                />
                {errors.quantity && <div className="text-red-500 text-sm mt-1">{errors.quantity}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Rate per kg (LKR)</label>
                <input
                  type="number"
                  name="ratePerKg"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.ratePerKg && 'border-red-500'}`}
                  placeholder="Enter rate per kilogram"
                  value={ratePerKg}
                  onChange={(e) => {
                    setRatePerKg(e.target.value);
                    handleInputChange(e, validateRate);
                  }}
                  min="0.01"
                  step="0.01"
                />
                {errors.ratePerKg && <div className="text-red-500 text-sm mt-1">{errors.ratePerKg}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300'
                >
                  <option value="monthly">Monthly Payment</option>
                  <option value="spot">Spot Payment</option>
                </select>
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Delivery Date</label>
                <input
                  type="date"
                  name="deliveryDate"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.deliveryDate && 'border-red-500'}`}
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    handleInputChange(e, validateDeliveryDate);
                  }}
                />
                {errors.deliveryDate && <div className="text-red-500 text-sm mt-1">{errors.deliveryDate}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Notes</label>
                <textarea
                  name="notes"
                  className='border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300'
                  placeholder="Enter any additional notes..."
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              {/* Summary Section */}
              <div className='bg-gray-50 p-4 rounded-md'>
                <h3 className='text-lg font-semibold text-gray-800 mb-2'>Summary</h3>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-600'>Quantity:</span>
                    <span className='ml-2 font-medium'>{quantity || '0'} kg</span>
                  </div>
                  <div>
                    <span className='text-gray-600'>Rate:</span>
                    <span className='ml-2 font-medium'>LKR {ratePerKg || '0'}</span>
                  </div>
                  <div className='col-span-2'>
                    <span className='text-gray-600'>Total Amount:</span>
                    <span className='ml-2 text-xl font-bold text-green-600'>LKR {totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className='flex gap-4'>
                <button
                  type='submit'
                  className='py-2 px-6 bg-green-600 text-white rounded-md hover:bg-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Record'}
                </button>
                <button
                  type='button'
                  className='py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none'
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
}
