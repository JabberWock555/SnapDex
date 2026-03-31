import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { User, Building, Briefcase, Phone, Mail, Globe, MapPin, Save, X, Tag } from 'lucide-react';

interface ContactFormProps {
  initialData: Partial<Contact>;
  imageUrl?: string;
  existingTags: string[];
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}

export default function ContactForm({ initialData, imageUrl, existingTags, onSave, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState<Partial<Contact>>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate an ID and timestamp if this is a new contact
    const finalContact: Contact = {
      id: formData.id || crypto.randomUUID(),
      scanDate: formData.scanDate || Date.now(),
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      company: formData.company || '',
      jobTitle: formData.jobTitle || '',
      phone: formData.phone || '',
      email: formData.email || '',
      website: formData.website || '',
      address: formData.address || '',
      tag: formData.tag || '',
      imageUrl: imageUrl || formData.imageUrl,
    };
    
    onSave(finalContact);
  };

  return (
    <div className="bg-[#181818] rounded-2xl shadow-sm border border-gray-800 overflow-hidden flex flex-col h-full max-h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/50">
        <h2 className="text-lg font-semibold text-white">Review Details</h2>
        <button 
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-800 shadow-sm flex justify-center bg-[#171717] p-2">
            <img src={imageUrl} alt="Scanned Card" className="w-full max-w-md h-auto object-contain rounded-lg shadow-sm" />
          </div>
        )}

        <form id="contact-form" onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-[#171717] border border-gray-700 text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                  placeholder="Jane"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-[#171717] border border-gray-700 text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Company</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                name="company"
                value={formData.company || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 bg-[#171717] border border-gray-700 text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Job Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 bg-[#171717] border border-gray-700 text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                placeholder="CEO"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 bg-[#171717] border border-gray-700 text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 bg-[#171717] border border-gray-700 text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Website</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 bg-[#171717] border border-gray-700 text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 bg-[#171717] border border-gray-700 text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                placeholder="123 Business Rd, City, State"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tag</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                name="tag"
                list="existing-tags"
                value={formData.tag || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 bg-[#171717] border border-gray-700 text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                placeholder="e.g. Conference, Client, Vendor"
              />
              <datalist id="existing-tags">
                {existingTags.map(tag => <option key={tag} value={tag} />)}
              </datalist>
            </div>
          </div>
        </form>
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-800/50">
        <button
          type="submit"
          form="contact-form"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00254c] text-white rounded-xl font-medium hover:bg-[#001a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00254c] transition-all shadow-sm"
        >
          <Save className="w-5 h-5" />
          Save to Contacts
        </button>
      </div>
    </div>
  );
}
