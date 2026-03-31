import React from 'react';
import { Contact } from '../types';
import { Clock, User, Building, ChevronRight, Tag as TagIcon } from 'lucide-react';

interface SidebarProps {
  history: Contact[];
  onSelectContact: (contact: Contact) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ history, onSelectContact, isOpen, setIsOpen }: SidebarProps) {
  const groupedHistory = history.reduce((acc, contact) => {
    const tag = contact.tag || 'Uncategorized';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);

  const tags = Object.keys(groupedHistory).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-[#181818] border-r border-gray-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-lg tracking-tight">Scan History</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-400">No scans yet. Scan a business card to get started.</p>
            </div>
          ) : (
            tags.map(tag => (
              <div key={tag} className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                  <TagIcon className="w-3.5 h-3.5 text-gray-500" />
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{tag}</h3>
                </div>
                {groupedHistory[tag].map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      onSelectContact(contact);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700 group flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-white truncate">
                          {contact.firstName} {contact.lastName}
                        </p>
                      </div>
                      {contact.company && (
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          <p className="text-xs text-gray-400 truncate">{contact.company}</p>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
