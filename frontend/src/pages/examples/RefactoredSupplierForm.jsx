// Example of how to refactor existing forms using shared components
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, PageHeader, FormInput, Button, Modal } from '../../components/shared';
import { useFormValidation, formValidators } from '../../utils/validation';
import { commonApi } from '../../utils/api';

const RefactoredSupplierForm = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Using the shared validation hook
  const {
    data,
    errors,
    updateField,
    validateAll,
    reset
  } = useFormValidation(
    {
      name: '',
      contactNumber: '',
      nicNumber: '',
      address: '',
      bankAccountNumber: '',
      bankName: '',
      rate: '',
    },
    formValidators.supplier
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    setLoading(true);
    const result = await commonApi.suppliers.create(data);
    setLoading(false);

    if (result.success) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
    navigate('/suppliers');
  };

  return (
    <Layout>
      <PageHeader
        title="Add New Supplier"
        subtitle="Enter supplier information to add them to the system"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Suppliers', href: '/suppliers' },
          { label: 'Add Supplier' }
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Supplier Name"
                name="name"
                value={data.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
                placeholder="Enter supplier name"
                required
              />

              <FormInput
                label="Contact Number"
                name="contactNumber"
                type="tel"
                value={data.contactNumber}
                onChange={(e) => updateField('contactNumber', e.target.value)}
                error={errors.contactNumber}
                placeholder="Enter contact number"
                required
              />

              <FormInput
                label="NIC Number"
                name="nicNumber"
                value={data.nicNumber}
                onChange={(e) => updateField('nicNumber', e.target.value)}
                error={errors.nicNumber}
                placeholder="Enter NIC number"
                required
              />

              <FormInput
                label="Rate per KG"
                name="rate"
                type="number"
                value={data.rate}
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
              value={data.address}
              onChange={(e) => updateField('address', e.target.value)}
              error={errors.address}
              placeholder="Enter supplier address"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Bank Account Number"
                name="bankAccountNumber"
                value={data.bankAccountNumber}
                onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                error={errors.bankAccountNumber}
                placeholder="Enter bank account number"
                required
              />

              <FormInput
                label="Bank Name"
                name="bankName"
                value={data.bankName}
                onChange={(e) => updateField('bankName', e.target.value)}
                error={errors.bankName}
                placeholder="Enter bank name"
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/suppliers')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Supplier'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Success!"
        size="small"
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Supplier Created Successfully
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            The supplier has been added to the system and can now receive deliveries.
          </p>
          <Button onClick={handleCloseModal}>
            Continue
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default RefactoredSupplierForm;
