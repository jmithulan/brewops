import React, { useState, useEffect } from 'react';
import { Layout, PageHeader, FormInput, Button, Modal } from '../components/shared';
import { useFormValidation, formValidators } from '../utils/validation';
import { commonApi } from '../utils/api';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Form validation
  const {
    data: formData,
    errors,
    updateField,
    validateAll,
    reset
  } = useFormValidation(
    {
      name: '',
      contact_number: '',
      nic_number: '',
      address: '',
      bank_account_number: '',
      bank_name: '',
      rate: '',
      supplier_id: '',
    },
    formValidators.supplier
  );

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    const result = await commonApi.suppliers.getAll();
    if (result.success) {
      setSuppliers(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = editingSupplier 
        ? await commonApi.suppliers.update(editingSupplier.id, formData)
        : await commonApi.suppliers.create(formData);

      if (result.success) {
        await fetchSuppliers();
        setShowModal(false);
        reset();
        setEditingSupplier(null);
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
    
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    Object.keys(formData).forEach(key => {
      updateField(key, supplier[key] || '');
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (supplier) => {
    if (window.confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      const result = await commonApi.suppliers.delete(supplier.id);
      if (result.success) {
        await fetchSuppliers();
      }
    }
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_number.includes(searchTerm) ||
                         supplier.supplier_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || supplier.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    reset();
  };

  return (
    <Layout>
      <PageHeader
        title="Supplier Management"
        subtitle="Manage tea suppliers, their details, and payment preferences"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Suppliers' }
        ]}
        actions={
          <Button onClick={() => setShowModal(true)}>
            <FaPlus className="mr-2" />
            Add Supplier
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Suppliers</option>
            <option value="supplier">Suppliers</option>
            <option value="premium">Premium</option>
            <option value="regular">Regular</option>
          </select>

          <Button variant="outline">
            <FaFilter className="mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {supplier.supplier_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {supplier.contact_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {supplier.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {supplier.bank_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ****{supplier.bank_account_number?.slice(-4)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rs. {supplier.rate}/kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      supplier.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {supplier.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No suppliers found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Supplier Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Supplier Name"
              name="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              placeholder="Enter supplier name"
              required
            />

            <FormInput
              label="Contact Number"
              name="contact_number"
              type="tel"
              value={formData.contact_number}
              onChange={(e) => updateField('contact_number', e.target.value)}
              error={errors.contact_number}
              placeholder="Enter contact number"
              required
            />

            <FormInput
              label="NIC Number"
              name="nic_number"
              value={formData.nic_number}
              onChange={(e) => updateField('nic_number', e.target.value)}
              error={errors.nic_number}
              placeholder="Enter NIC number"
              required
            />

            <FormInput
              label="Rate per KG"
              name="rate"
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => updateField('rate', e.target.value)}
              error={errors.rate}
              placeholder="Enter rate per kg"
              required
            />
          </div>

          <FormInput
            label="Address"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            error={errors.address}
            placeholder="Enter supplier address"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Bank Account Number"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={(e) => updateField('bank_account_number', e.target.value)}
              error={errors.bank_account_number}
              placeholder="Enter bank account number"
              required
            />

            <FormInput
              label="Bank Name"
              name="bank_name"
              value={formData.bank_name}
              onChange={(e) => updateField('bank_name', e.target.value)}
              error={errors.bank_name}
              placeholder="Enter bank name"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default SupplierManagement;
