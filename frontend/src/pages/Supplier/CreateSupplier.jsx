import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const CreateSupplier = () => {
<<<<<<< HEAD
=======
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';
>>>>>>> b34fc7b (init)
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [rate, setRate] = useState('150');
  const [createdSupplierId, setCreatedSupplierId] = useState('');
  const [preGeneratedSupplierId, setPreGeneratedSupplierId] = useState('');
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
    // Generate the actual next supplier ID based on existing suppliers
    const generateSupplierID = async () => {
      try {
        // Try to get the next ID from the server first
        const token = localStorage.getItem('jwtToken');
        
        try {
<<<<<<< HEAD
          const response = await axios.get('http://localhost:5000/api/suppliers/next-id', {
=======
          const response = await axios.get(`${API_URL}/api/suppliers/next-id`, {
>>>>>>> b34fc7b (init)
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.success) {
            setPreGeneratedSupplierId(response.data.next_id);
            return;
          }
        } catch (apiError) {
          console.log('Next-id endpoint not available, calculating manually...');
        }

        // Fallback: calculate the next ID based on existing suppliers
<<<<<<< HEAD
        const suppliersResponse = await axios.get('http://localhost:5000/api/suppliers', {
=======
        const suppliersResponse = await axios.get(`${API_URL}/api/suppliers`, {
>>>>>>> b34fc7b (init)
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let nextNumber = 1;
        if (suppliersResponse.data && suppliersResponse.data.data) {
          // Extract all existing supplier IDs and find the highest number
          const existingNumbers = suppliersResponse.data.data
            .map(supplier => supplier.supplier_id)
            .filter(id => id && typeof id === 'string' && id.match(/^SUP\d+$/))
            .map(id => {
              const match = id.match(/^SUP(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter(num => !isNaN(num) && num > 0);
          
          if (existingNumbers.length > 0) {
            nextNumber = Math.max(...existingNumbers) + 1;
          }
        }
        
        const nextId = `SUP${String(nextNumber).padStart(5, '0')}`;
        setPreGeneratedSupplierId(nextId);
        
      } catch (error) {
        console.error('Error generating supplier ID:', error);
        // Ultimate fallback: start with SUP00001
        setPreGeneratedSupplierId('SUP00001');
      }
    };

    generateSupplierID();
  }, []);

  // Validation functions
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

  const handleSaveSupplier = async () => {
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
<<<<<<< HEAD
      const res = await axios.post('http://localhost:5000/api/suppliers', data, {
=======
      const res = await axios.post(`${API_URL}/api/suppliers`, data, {
>>>>>>> b34fc7b (init)
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setCreatedSupplierId(res.data.data.supplier_id || '');
        setName('');
        setContact('');
        setNicNumber('');
        setAddress('');
        setBankAccount('');
        setBankName('');
        setRate('150');
        
        toast.success('Supplier created successfully!');
        
        // Navigate back to SupplierHome after successful creation with timestamp
        setTimeout(() => {
          navigate('/SupplierHome', { 
            state: { refresh: true, timestamp: Date.now(), message: 'Supplier added successfully!' } 
          });
        }, 200);
      } else {
        toast.error(res.data?.message || 'Failed to save supplier');
      }
    } catch (err) {
      toast.error('Error saving supplier: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => navigate('/SupplierHome')}>
      <div className='max-w-2xl w-full max-h-[90vh] bg-white rounded-lg shadow-md flex flex-col' onClick={e => e.stopPropagation()}>
        <div className='overflow-y-auto flex-1 p-8'>
          <h1 className='text-2xl my-2 text-center font-bold text-gray-800'>Add New Supplier</h1>
          {loading && <Spinner />}
          {!loading && (
            <form className='space-y-4' onSubmit={e => { e.preventDefault(); handleSaveSupplier(); }}>
              <div>
                <label className='block text-md mb-2 text-gray-700'>Supplier ID</label>
                <input
                  type="text"
                  value={createdSupplierId || preGeneratedSupplierId || ''}
                  placeholder={createdSupplierId || preGeneratedSupplierId ? '' : 'Will be generated (SUP00001, SUP00002, etc.)'}
                  disabled
                  className='border border-gray-300 bg-gray-100 text-gray-700 px-4 py-2 w-full rounded-md'
                />
                <p className='text-xs text-gray-500 mt-1'>Supplier ID is auto-generated in format SUP00001, SUP00002, etc.</p>
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
                  {loading ? 'Saving...' : 'Save Supplier'}
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
};

export default CreateSupplier;
