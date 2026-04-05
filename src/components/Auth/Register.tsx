import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { clearAuthError, registerUser } from '../../store/slice/authSlice';

const rankOptions = [
  'General',
  'Lieutenant General',
  'Major General',
  'Brigadier',
  'Colonel',
  'Lieutenant Colonel',
  'Major',
  'Captain',
  'Lieutenant',
  'Subedar Major',
  'Subedar',
  'Naib Subedar',
  'Havildar',
  'Naik',
  'Lance Naik',
  'Sepoy',
];

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    serviceNumber: '',
    rank: '',
    fullName: '',
    unit: '',
    password: '',
    confirmPassword: '',
    role: 'WORKER' as 'WORKER' | 'CHECKPOINT ADMIN'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const apiErrorMessages = useSelector((state: RootState) => state.auth.errorMessages);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceNumber.trim()) {
      newErrors.serviceNumber = 'Service Number is required';
    }

    if (!formData.rank) {
      newErrors.rank = 'Rank is required';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    } else if (!/^\d+-\w+$/.test(formData.unit)) {
      newErrors.unit = 'Unit must be in format: battalionNo-regiment (e.g., 32-Grenadiers)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const payload = {
        serviceNumber: formData.serviceNumber.trim(),
        rank: formData.rank,
        name: formData.fullName.trim(),
        unit: formData.unit.trim(),
        password: formData.password,
        role: formData.role,
      };

      const result = await dispatch(registerUser(payload)).unwrap();
      setSuccessMessage(result.message ?? 'Registration successful.');

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch {
      // API error is handled through Redux state.
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (successMessage) {
      setSuccessMessage(null);
    }

    if (apiErrorMessages.length > 0) {
      dispatch(clearAuthError());
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">CVAS Registration</h2>
          <p className="mt-2 text-gray-400">Civil Vehicle Acquisition System</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {apiErrorMessages.map((message, index) => (
            <div
              key={`${message}-${index}`}
              className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded"
            >
              {message}
            </div>
          ))}

          <div>
            <label htmlFor="serviceNumber" className="block text-sm font-medium text-gray-300">
              Service Number
            </label>
            <input
              id="serviceNumber"
              name="serviceNumber"
              type="text"
              value={formData.serviceNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter service number"
            />
            {errors.serviceNumber && (
              <p className="mt-1 text-sm text-red-400">{errors.serviceNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="rank" className="block text-sm font-medium text-gray-300">
              Rank
            </label>
            <select
              id="rank"
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select rank</option>
              {rankOptions.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
            {errors.rank && (
              <p className="mt-1 text-sm text-red-400">{errors.rank}</p>
            )}
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Ravi Kumar"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-300">
              Unit
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              value={formData.unit}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., 32-Grenadiers"
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-400">{errors.unit}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                placeholder="Confirm password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="WORKER">Worker</option>
              <option value="CHECKPOINT ADMIN">Checkpoint Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;