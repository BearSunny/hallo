import React from 'react';
import { ArrowLeft, Plus, User, Heart, Settings } from 'lucide-react';

interface CaregiverPanelProps {
  onNavigate: (page: 'add-medication' | 'dashboard' | 'manage') => void;
  onBack: () => void;
  onLogout: () => void;
}

const CaregiverPanel: React.FC<CaregiverPanelProps> = ({ onNavigate, onBack, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-12">
            <button
              onClick={onBack}
              className="mr-6 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft size={24} className="text-indigo-600" />
            </button>
            <h1 className="text-4xl font-bold text-gray-800">Caregiver Panel</h1>
            <div className="flex-1" />
            <button
              onClick={onLogout}
              className=" bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md transition ml-8"
            >
              Logout
            </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <button
            onClick={() => onNavigate('add-medication')}
            className="group bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Plus size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Medication</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Set up medication reminders with specific times and dosage instructions
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="group bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-purple-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                <Heart size={32} className="text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Info & Memories</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Manage patient profile, family information, and cherished memories
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('manage')}
            className="group bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-300">
                <Settings size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Information</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                View, edit, and delete existing medications and personal information
              </p>
            </div>
          </button>
        </div>

        <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Tips</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Set medication reminders at consistent times each day</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Add family photos and memories to help with recognition</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Include important dates and personal preferences</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Use the management page to review and update information regularly</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CaregiverPanel;