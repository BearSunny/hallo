import React, { useState } from 'react';
import { ArrowLeft, Clock, Pill, FileText } from 'lucide-react';
import { Medication } from '../types';

interface AddMedicationProps {
  onAddMedication: (medication: Medication) => void;
  onBack: () => void;
}

const AddMedication: React.FC<AddMedicationProps> = ({ onAddMedication, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    time: '',
    dosage: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.time) {
      onAddMedication({
        id: '',
        name: formData.name,
        time: formData.time,
        dosage: formData.dosage,
        notes: formData.notes
      });
      setFormData({ name: '', time: '', dosage: '', notes: '' });
      alert('Medication reminder added successfully!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-12">
          <button
            onClick={onBack}
            className="mr-6 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={24} className="text-indigo-600" />
          </button>
          <h1 className="text-4xl font-bold text-gray-800">Add Medication</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                <Pill className="mr-3 text-blue-600" size={24} />
                Medication Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                placeholder="Enter medication name"
              />
            </div>

            <div>
              <label className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                <Clock className="mr-3 text-blue-600" size={24} />
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
              />
            </div>

            <div>
              <label className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                <Pill className="mr-3 text-blue-600" size={24} />
                Dosage
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                placeholder="e.g., 1 tablet, 5mg, etc."
              />
            </div>

            <div>
              <label className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                <FileText className="mr-3 text-blue-600" size={24} />
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none"
                placeholder="Special instructions, side effects to watch for, etc."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Add Medication Reminder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedication;