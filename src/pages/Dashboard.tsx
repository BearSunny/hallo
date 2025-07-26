import React, { useState } from 'react';
import { ArrowLeft, User, Heart, Calendar, Plus, X } from 'lucide-react';
import { PatientProfile, MemoryPrompt, FamilyMember } from '../types';

interface DashboardProps {
  patientProfile: PatientProfile | null;
  memoryPrompts: MemoryPrompt[];
  onUpdateProfile: (profile: PatientProfile) => void;
  onAddMemory: (memory: MemoryPrompt) => void;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  patientProfile,
  memoryPrompts,
  onUpdateProfile,
  onAddMemory,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'memories'>('profile');
  const [profileData, setProfileData] = useState<PatientProfile>(
    patientProfile || {
      name: '',
      age: undefined,
      familyMembers: [],
      personalMemories: [],
      importantDates: [],
      preferences: {}
    }
  );
  const [newMemory, setNewMemory] = useState('');
  const [newFamilyMember, setNewFamilyMember] = useState({ name: '', relationship: '' });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileData);
    alert('Profile updated successfully!');
  };

  const addFamilyMember = () => {
    if (newFamilyMember.name && newFamilyMember.relationship) {
      setProfileData(prev => ({
        ...prev,
        familyMembers: [...prev.familyMembers, newFamilyMember]
      }));
      setNewFamilyMember({ name: '', relationship: '' });
    }
  };

  const removeFamilyMember = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index)
    }));
  };

  const addPersonalMemory = () => {
    if (newMemory.trim()) {
      setProfileData(prev => ({
        ...prev,
        personalMemories: [...prev.personalMemories, newMemory.trim()]
      }));
      
      onAddMemory({
        id: '',
        type: 'memory',
        content: newMemory.trim(),
        frequency: 'occasional'
      });
      
      setNewMemory('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-12">
          <button
            onClick={onBack}
            className="mr-6 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={24} className="text-purple-600" />
          </button>
          <h1 className="text-4xl font-bold text-gray-800">Personal Dashboard</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-6 px-8 text-xl font-semibold transition-colors duration-200 ${
                activeTab === 'profile'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="inline mr-3" size={24} />
              Profile & Family
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`flex-1 py-6 px-8 text-xl font-semibold transition-colors duration-200 ${
                activeTab === 'memories'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className="inline mr-3" size={24} />
              Memories
            </button>
          </div>

          <div className="p-12">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xl font-semibold text-gray-700 mb-4">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                      placeholder="Enter patient's name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xl font-semibold text-gray-700 mb-4">
                      Age
                    </label>
                    <input
                      type="number"
                      value={profileData.age || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                      className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                      placeholder="Enter age"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-6">Family Members</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      value={newFamilyMember.name}
                      onChange={(e) => setNewFamilyMember(prev => ({ ...prev, name: e.target.value }))}
                      className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={newFamilyMember.relationship}
                      onChange={(e) => setNewFamilyMember(prev => ({ ...prev, relationship: e.target.value }))}
                      className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Relationship"
                    />
                    <button
                      type="button"
                      onClick={addFamilyMember}
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {profileData.familyMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <span className="text-lg">
                          <strong>{member.name}</strong> - {member.relationship}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFamilyMember(index)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Save Profile
                </button>
              </form>
            )}

            {activeTab === 'memories' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-6">Add New Memory</h3>
                  <div className="flex gap-4">
                    <textarea
                      value={newMemory}
                      onChange={(e) => setNewMemory(e.target.value)}
                      rows={3}
                      className="flex-1 p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200 resize-none"
                      placeholder="Share a cherished memory, story, or important detail..."
                    />
                    <button
                      onClick={addPersonalMemory}
                      className="bg-purple-600 text-white px-6 py-4 rounded-xl hover:bg-purple-700 transition-colors duration-200 self-start"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-6">Saved Memories</h3>
                  <div className="space-y-4">
                    {profileData.personalMemories.map((memory, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-l-4 border-purple-500">
                        <p className="text-lg text-gray-700 leading-relaxed">{memory}</p>
                      </div>
                    ))}
                    {profileData.personalMemories.length === 0 && (
                      <p className="text-gray-500 text-center py-8 text-lg">
                        No memories added yet. Start by sharing a special moment or story.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;