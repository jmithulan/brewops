import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import toast, { Toaster } from 'react-hot-toast';

export default function EditSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [rate, setRate] = useState('');
  const [supplierId, setSupplierId] = useState('');
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

  // Validation functions (same as CreateSupplier)
  const validateName = (value) => {
    if (!value.trim()) return 'Name is required';
    if (value.length < 5 || value.length > 20) return 'Name must be 5–20 characters';
    return '';
  };
  const validateContact = (value) => {
    if (!value.trim()) return 'Contact number is required';
    if (!/^\d{10}$/.test(value)) return 'Contact number must be 10 digits';
    return '';
  };
  const validateNicNumber = (value) => {
    if (!value.trim()) return 'NIC number is required';
    if (!/^(\d{9}[vVxX]|\d{12})$/.test(value)) return 'NIC must be 9 digits + V/X or 12 digits';
    return '';
  };
  const validateAddress = (value) => {
    if (!value.trim()) return 'Address is required';
    if (value.length < 10 || value.length > 100) return 'Address must be 10–100 characters';
    return '';
  };
  const validateBankAccount = (value) => {
    if (!value.trim()) return 'Bank account number is required';
    if (!/^\d{6,20}$/.test(value)) return 'Bank account number must be 6-20 digits';
    return '';
  };
  const validateBankName = (value) => {
    if (!value.trim()) return 'Bank name is required';
    return '';
  };
  const validateRate = (value) => {
    if (!value.trim()) return 'Rate is required';
    if (isNaN(value) || Number(value) < 1) return 'Rate must be a positive number';
    return '';
  };

  const handleInputChange = (e, validator) => {
    const { name, value } = e.target;
    const error = validator(value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  // Fetch existing supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(`http://localhost:5000/api/suppliers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.success) {
          const supplier = response.data.data;
          setSupplierId(supplier.supplier_id || '');
          setName(supplier.name || '');
          setContact(supplier.contact_number || '');
          setNicNumber(supplier.nic_number || '');
          setAddress(supplier.address || '');
          setBankAccount(supplier.bank_account_number || '');
          setBankName(supplier.bank_name || '');
          setRate(supplier.rate?.toString() || '');
        } else {
          toast.error('Failed to load supplier data');
        }
      } catch (error) {
        toast.error('Error loading supplier details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSupplier();
    }
  }, [id]);

  const handleUpdateSupplier = async () => {
    const newErrors = {
      name: validateName(name),
      contact: validateContact(contact),
      nicNumber: validateNicNumber(nicNumber),
      address: validateAddress(address),
      bankAccount: validateBankAccount(bankAccount),
      bankName: validateBankName(bankName),
      rate: validateRate(rate),
    };
    setErrors(newErrors);
    const isValid = !Object.values(newErrors).some((err) => err !== '');
    if (!isValid) return;

    const data = {
      name,
      contact_number: contact,
      nic_number: nicNumber,
      address,
      bank_account_number: bankAccount,
      bank_name: bankName,
      rate: Number(rate)
    };
    
    setLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      
      const res = await axios.put(`http://localhost:5000/api/suppliers/${id}`, data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data && res.data.success) {
        toast.success('Supplier updated successfully!');
        // Navigate back to SupplierHome with refresh and timestamp to force immediate update
        setTimeout(() => {
          navigate('/SupplierHome', { 
            state: { refresh: true, timestamp: Date.now(), message: 'Supplier updated successfully!' } 
          });
        }, 200);
      } else {
        toast.error(res.data?.message || 'Failed to update supplier');
      }
    } catch (err) {
      if (err.response?.status === 500) {
        toast.error('Server error occurred. Please try again.');
      } else if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (err.response?.status === 404) {
        toast.error('Supplier not found.');
      } else {
        toast.error('Error updating supplier: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => navigate('/SupplierHome')}>
      <Toaster position="top-center" />
      <div className='max-w-2xl w-full max-h-[90vh] bg-white rounded-lg shadow-md flex flex-col' onClick={e => e.stopPropagation()}>
        <div className='overflow-y-auto flex-1 p-8'>
          <h1 className='text-2xl my-2 text-center font-bold text-gray-800'>Edit Supplier</h1>
          {loading && <Spinner />}
          {!loading && (
            <form className='space-y-4' onSubmit={e => { e.preventDefault(); handleUpdateSupplier(); }}>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Supplier ID</label>
                <input
                  type="text"
                  value={supplierId}
                  disabled
                  className='border border-gray-300 bg-gray-100 text-gray-700 px-4 py-2 w-full rounded-md'
                />
                <p className='text-xs text-gray-500 mt-1'>Supplier ID cannot be changed.</p>
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Supplier Name</label>
                <input
                  type="text"
                  name="name"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.name && 'border-red-500'}`}
                  placeholder="Enter Supplier Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    handleInputChange(e, validateName);
                  }}
                />
                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Contact Number</label>
                <input
                  type="text"
                  name="contact"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.contact && 'border-red-500'}`}
                  placeholder="Enter Contact Number"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    handleInputChange(e, validateContact);
                  }}
                />
                {errors.contact && <div className="text-red-500 text-sm mt-1">{errors.contact}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>NIC Number</label>
                <input
                  type="text"
                  name="nicNumber"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.nicNumber && 'border-red-500'}`}
                  placeholder="Enter NIC Number (e.g., 123456789V or 200012345678)"
                  value={nicNumber}
                  onChange={(e) => {
                    setNicNumber(e.target.value);
                    handleInputChange(e, validateNicNumber);
                  }}
                />
                {errors.nicNumber && <div className="text-red-500 text-sm mt-1">{errors.nicNumber}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Address</label>
                <textarea
                  name="address"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.address && 'border-red-500'}`}
                  placeholder="Enter Full Address"
                  rows="3"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    handleInputChange(e, validateAddress);
                  }}
                />
                {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccount"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.bankAccount && 'border-red-500'}`}
                  placeholder="Enter Bank Account Number"
                  value={bankAccount}
                  onChange={(e) => {
                    setBankAccount(e.target.value);
                    handleInputChange(e, validateBankAccount);
                  }}
                />
                {errors.bankAccount && <div className="text-red-500 text-sm mt-1">{errors.bankAccount}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.bankName && 'border-red-500'}`}
                  placeholder="Enter Bank Name"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    handleInputChange(e, validateBankName);
                  }}
                />
                {errors.bankName && <div className="text-red-500 text-sm mt-1">{errors.bankName}</div>}
              </div>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Rate (LKR per kg)</label>
                <input
                  type="number"
                  name="rate"
                  className={`border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring focus:ring-green-300 ${errors.rate && 'border-red-500'}`}
                  placeholder="Enter Rate"
                  value={rate}
                  onChange={(e) => {
                    setRate(e.target.value);
                    handleInputChange(e, validateRate);
                  }}
                  min="1"
                />
                {errors.rate && <div className="text-red-500 text-sm mt-1">{errors.rate}</div>}
              </div>
              <div className='flex gap-4'>
                <button
                  type='submit'
                  className='py-2 px-6 bg-green-600 text-white rounded-md hover:bg-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Supplier'}
                </button>
                <button
                  type='button'
                  className='py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none'
                  onClick={() => navigate('/SupplierHome')}
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
