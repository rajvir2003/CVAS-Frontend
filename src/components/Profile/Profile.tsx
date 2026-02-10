import React from 'react';
import { User, Mail, Shield, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const profileData = [
    {
      label: 'Service Number',
      value: user.serviceNumber,
      icon: Shield
    },
    {
      label: 'Full Name',
      value: user.name,
      icon: User
    },
    // {
    //   label: 'Unit',
    //   value: user.unit,
    //   icon: Users
    // },
    // {
    //   label: 'Email',
    //   value: user.email,
    //   icon: Mail
    // },
    {
      label: 'Role',
      value: user.role.replace('_', ' ').toUpperCase(),
      icon: Shield
    }
  ];

  if (user.checkpoint) {
    profileData.push({
      label: 'Checkpoint',
      value: user.checkpoint,
      icon: Shield
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <User className="h-8 w-8 text-green-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-gray-400">Your account information</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <div className="space-y-6">
          {profileData.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <item.icon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className="text-lg text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
        <h3 className="text-lg font-semibold text-blue-200 mb-2">Account Status</h3>
        <p className="text-blue-300">Your account is active and in good standing.</p>
      </div>
    </div>
  );
};

export default Profile;