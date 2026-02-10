import React, { useState } from 'react';
import { Truck, Upload, RotateCcw, Send } from 'lucide-react';

interface VehicleData {
  regnNo: string;
  loadClass: string;
  loadType: string;
  customLoadType: string;
  photo: File | null;
}

const VehicleEntry: React.FC = () => {
  const [formData, setFormData] = useState<VehicleData>({
    regnNo: '',
    loadClass: '',
    loadType: '',
    customLoadType: '',
    photo: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadClasses = [
    'Less than 9 ton',
    '9 ton',
    '18 ton',
    '24 ton'
  ];

  const loadTypes = [
    'Packages',
    'Industrial',
    'Agricultural',
    'Other'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.regnNo.trim()) {
      newErrors.regnNo = 'Vehicle Registration Number is required';
    } else if (/[\s-]/.test(formData.regnNo)) {
      newErrors.regnNo = 'Registration number cannot contain spaces or dashes';
    }

    if (!formData.loadClass) {
      newErrors.loadClass = 'Load Class is required';
    }

    if (!formData.loadType) {
      newErrors.loadType = 'Load Type is required';
    }

    if (formData.loadType === 'Other' && !formData.customLoadType.trim()) {
      newErrors.customLoadType = 'Custom load type is required when "Other" is selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Vehicle registered successfully!');
      
      // Reset form
      handleClear();
    } catch (error) {
      alert('Error registering vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      regnNo: '',
      loadClass: '',
      loadType: '',
      customLoadType: '',
      photo: null
    });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, photo: file }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Truck className="h-8 w-8 text-green-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Entry</h1>
          <p className="text-gray-400">Register a new civilian vehicle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 space-y-6">
        <div>
          <label htmlFor="regnNo" className="block text-sm font-medium text-gray-300 mb-2">
            Vehicle Registration Number
          </label>
          <input
            type="text"
            id="regnNo"
            name="regnNo"
            value={formData.regnNo}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter registration number (no spaces or dashes)"
          />
          {errors.regnNo && (
            <p className="mt-1 text-sm text-red-400">{errors.regnNo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Load Class
          </label>
          <div className="grid grid-cols-2 gap-4">
            {loadClasses.map((loadClass) => (
              <label key={loadClass} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="loadClass"
                  value={loadClass}
                  checked={formData.loadClass === loadClass}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 bg-gray-700"
                />
                <span className="text-sm text-gray-300">{loadClass}</span>
              </label>
            ))}
          </div>
          {errors.loadClass && (
            <p className="mt-1 text-sm text-red-400">{errors.loadClass}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Load Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            {loadTypes.map((loadType) => (
              <label key={loadType} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="loadType"
                  value={loadType}
                  checked={formData.loadType === loadType}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 bg-gray-700"
                />
                <span className="text-sm text-gray-300">{loadType}</span>
              </label>
            ))}
          </div>
          {errors.loadType && (
            <p className="mt-1 text-sm text-red-400">{errors.loadType}</p>
          )}
        </div>

        {formData.loadType === 'Other' && (
          <div>
            <label htmlFor="customLoadType" className="block text-sm font-medium text-gray-300 mb-2">
              Specify Load Type
            </label>
            <input
              type="text"
              id="customLoadType"
              name="customLoadType"
              value={formData.customLoadType}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter custom load type"
            />
            {errors.customLoadType && (
              <p className="mt-1 text-sm text-red-400">{errors.customLoadType}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-2">
            Photo Upload (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="photo"
              className="flex items-center space-x-2 px-4 py-2 border border-gray-600 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
            >
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-300">
                {formData.photo ? formData.photo.name : 'Choose Photo'}
              </span>
            </label>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Clear</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleEntry;