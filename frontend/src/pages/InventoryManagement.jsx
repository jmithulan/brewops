import React, { useState, useEffect } from 'react';
import { Layout, PageHeader, FormInput, Button, Modal } from '../components/shared';
import { useFormValidation, formValidators } from '../utils/validation';
import { commonApi } from '../utils/api';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaFilter, FaExclamationTriangle } from 'react-icons/fa';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [lowStockAlert, setLowStockAlert] = useState(false);

  // Form validation
  const {
    data: formData,
    errors,
    updateField,
    validateAll,
    reset
  } = useFormValidation(
    {
      inventoryid: '',
      quantity: '',
      quality_type: '',
      location: '',
      notes: '',
    },
    formValidators.inventory
  );

  // Fetch inventory
  const fetchInventory = async () => {
    setLoading(true);
    const result = await commonApi.inventory.getAll();
    if (result.success) {
      setInventory(result.data);
      checkLowStock(result.data);
    }
    setLoading(false);
  };

  // Check for low stock items
  const checkLowStock = (items) => {
    const lowStockItems = items.filter(item => item.quantity < 1000);
    setLowStockAlert(lowStockItems.length > 0);
    
    if (lowStockItems.length > 0) {
      // Send notification to production manager
      commonApi.notifications.create({
        title: 'Low Stock Alert',
        message: `${lowStockItems.length} items are below minimum stock level`,
        type: 'warning',
        recipient_role: 'manager',
        priority: 'high'
      });
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = editingItem 
        ? await commonApi.inventory.update(editingItem.id, formData)
        : await commonApi.inventory.create(formData);

      if (result.success) {
        await fetchInventory();
        setShowModal(false);
        reset();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
    
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    Object.keys(formData).forEach(key => {
      updateField(key, item[key] || '');
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete inventory item ${item.inventoryid}?`)) {
      const result = await commonApi.inventory.delete(item.id);
      if (result.success) {
        await fetchInventory();
      }
    }
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.inventoryid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.quality_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || item.quality_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    reset();
  };

  // Calculate total inventory
  const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockCount = inventory.filter(item => item.quantity < 1000).length;

  return (
    <Layout>
      <PageHeader
        title="Inventory Management"
        subtitle="Manage tea inventory, track stock levels, and monitor quality"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory' }
        ]}
        actions={
          <div className="flex space-x-3">
            {lowStockAlert && (
              <Button variant="outline" className="text-orange-600 border-orange-600">
                <FaExclamationTriangle className="mr-2" />
                Low Stock Alert ({lowStockCount})
              </Button>
            )}
            <Button onClick={() => setShowModal(true)}>
              <FaPlus className="mr-2" />
              Add Inventory
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaEye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaEye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quantity</p>
              <p className="text-2xl font-semibold text-gray-900">{totalQuantity.toLocaleString()} kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <FaExclamationTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-semibold text-gray-900">{lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaFilter className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quality Types</p>
              <p className="text-2xl font-semibold text-gray-900">
                {[...new Set(inventory.map(item => item.quality_type))].length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Quality Types</option>
            <option value="Premium Green Tea">Premium Green Tea</option>
            <option value="Standard Green Tea">Standard Green Tea</option>
            <option value="Premium Black Tea">Premium Black Tea</option>
            <option value="Standard Black Tea">Standard Black Tea</option>
            <option value="Oolong Tea">Oolong Tea</option>
            <option value="White Tea">White Tea</option>
          </select>

          <Button variant="outline">
            <FaFilter className="mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
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
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.inventoryid}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.quality_type || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.quantity?.toLocaleString()} kg
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.location || 'Warehouse'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.quantity < 1000 
                        ? 'bg-red-100 text-red-800' 
                        : item.quantity < 5000
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity < 1000 ? 'Low Stock' : item.quantity < 5000 ? 'Medium' : 'Good'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
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

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No inventory items found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Inventory Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Inventory ID"
              name="inventoryid"
              value={formData.inventoryid}
              onChange={(e) => updateField('inventoryid', e.target.value)}
              error={errors.inventoryid}
              placeholder="Enter inventory ID"
              required
            />

            <FormInput
              label="Quantity (kg)"
              name="quantity"
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
              error={errors.quantity}
              placeholder="Enter quantity in kg"
              required
            />

            <FormInput
              label="Quality Type"
              name="quality_type"
              type="select"
              value={formData.quality_type}
              onChange={(e) => updateField('quality_type', e.target.value)}
              error={errors.quality_type}
              required
            >
              <option value="">Select Quality Type</option>
              <option value="Premium Green Tea">Premium Green Tea</option>
              <option value="Standard Green Tea">Standard Green Tea</option>
              <option value="Premium Black Tea">Premium Black Tea</option>
              <option value="Standard Black Tea">Standard Black Tea</option>
              <option value="Oolong Tea">Oolong Tea</option>
              <option value="White Tea">White Tea</option>
            </FormInput>

            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              error={errors.location}
              placeholder="Enter storage location"
            />
          </div>

          <FormInput
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            error={errors.notes}
            placeholder="Enter any additional notes"
          />

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
              {editingItem ? 'Update Inventory' : 'Add Inventory'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default InventoryManagement;
