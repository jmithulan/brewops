import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authcontext.jsx';
import { toast } from 'react-hot-toast';

const WasteManagement = () => {
  const { user } = useAuth();
  const [wasteRecords, setWasteRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    quantity: '',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchWasteRecords();
  }, []);

  const fetchWasteRecords = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData = [
        {
          id: 1,
          type: 'Tea Leaves',
          quantity: '5.5',
          reason: 'Quality issues',
          date: '2024-01-15',
          recordedBy: 'Staff Member'
        },
        {
          id: 2,
          type: 'Packaging Material',
          quantity: '2.0',
          reason: 'Damaged during transport',
          date: '2024-01-14',
          recordedBy: 'Staff Member'
        }
      ];
      setWasteRecords(mockData);
    } catch (error) {
      toast.error('Failed to fetch waste records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mock submission - replace with actual API call
      const newRecord = {
        id: wasteRecords.length + 1,
        ...formData,
        recordedBy: user?.name || 'Staff Member'
      };
      setWasteRecords([newRecord, ...wasteRecords]);
      setFormData({
        type: '',
        quantity: '',
        reason: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      toast.success('Waste record added successfully');
    } catch (error) {
      toast.error('Failed to add waste record');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading waste management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Waste Management</h1>
          <p className="text-gray-600 mt-2">Track and manage waste materials in the tea factory</p>
        </div>

        {/* Add Record Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Waste Record
          </button>
        </div>

        {/* Add Record Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Waste Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waste Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select waste type</option>
                    <option value="Tea Leaves">Tea Leaves</option>
                    <option value="Packaging Material">Packaging Material</option>
                    <option value="Processing Waste">Processing Waste</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Waste Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Waste Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recorded By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wasteRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.recordedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {wasteRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No waste records found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteManagement;

