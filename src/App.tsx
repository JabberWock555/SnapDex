import React, { useState, useEffect } from 'react';
import { Menu, Aperture, LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import Scanner from './components/Scanner';
import ContactForm from './components/ContactForm';
import Sidebar from './components/Sidebar';
import AuthGate from './components/AuthGate';
import { Contact } from './types';
import { extractContactFromImage } from './lib/gemini';
import { downloadVCard } from './lib/vcard';
import { logEvent, setScreenName, setUserId } from './lib/analytics';
import { auth } from './lib/firebase';
import { loadContacts, saveContact } from './lib/db';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [history, setHistory] = useState<Contact[]>([]);
  const [currentScan, setCurrentScan] = useState<Partial<Contact> | null>(null);
  const [currentImage, setCurrentImage] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth state listener — loads contacts once user is known
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        setUserId(firebaseUser.uid);
        try {
          const contacts = await loadContacts(firebaseUser.uid);
          setHistory(contacts);
        } catch (e) {
          console.error('Failed to load contacts', e);
        }
      } else {
        setHistory([]);
      }
    });
    return unsubscribe;
  }, []);

  // Track screen views
  useEffect(() => {
    if (currentScan) {
      setScreenName('ContactDetail');
    } else {
      setScreenName('Home');
    }
  }, [currentScan]);

  const existingTags = Array.from(new Set(history.map(c => c.tag).filter(Boolean))) as string[];

  const handleCapture = async (base64Image: string) => {
    setIsProcessing(true);
    setError(null);
    setCurrentImage(base64Image);
    logEvent('scan_started');

    try {
      const extractedData = await extractContactFromImage(base64Image, existingTags);
      setCurrentScan(extractedData);
      logEvent('scan_success', { fields_found: Object.keys(extractedData).length });
    } catch (err) {
      console.error(err);
      setError('Failed to extract information. Please try again or enter manually.');
      logEvent('scan_failed', { error: err instanceof Error ? err.message : 'Unknown error' });
      setCurrentScan({});
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveContact = async (contact: Contact) => {
    if (!user) return;

    logEvent('contact_saved', { has_tag: !!contact.tag, tag: contact.tag });

    // Persist to Firestore
    try {
      await saveContact(user.uid, contact);
    } catch (e) {
      console.error('Failed to save contact to Firestore', e);
    }

    // Update local state
    setHistory(prev => {
      const exists = prev.some(c => c.id === contact.id);
      if (exists) return prev.map(c => c.id === contact.id ? contact : c);
      return [contact, ...prev];
    });

    downloadVCard(contact);
    setCurrentScan(null);
    setCurrentImage(undefined);
  };

  const handleCancel = () => {
    logEvent('scan_cancelled');
    setCurrentScan(null);
    setCurrentImage(undefined);
    setError(null);
  };

  const handleSelectHistory = (contact: Contact) => {
    logEvent('history_item_selected');
    setCurrentScan(contact);
    setCurrentImage(contact.imageUrl);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setCurrentScan(null);
    setCurrentImage(undefined);
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <Aperture className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  return (
    <div className="flex h-screen bg-[#171717] font-sans overflow-hidden text-gray-100">
      <Sidebar
        history={history}
        onSelectContact={handleSelectHistory}
        isOpen={isSidebarOpen}
        setIsOpen={(open) => {
          setIsSidebarOpen(open);
          if (open) logEvent('sidebar_opened');
        }}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-[#181818] border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-400 hover:bg-gray-800 rounded-lg md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-blue-500">
              <Aperture className="w-6 h-6" />
              <h1 className="text-xl font-bold text-white tracking-tight">SnapDex</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentScan && (
              <button
                onClick={handleCancel}
                className="text-sm font-medium text-gray-400 hover:text-white"
              >
                New Scan
              </button>
            )}
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {error && (
            <div className="absolute top-4 left-4 right-4 z-30 bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded-xl shadow-sm flex items-center justify-between backdrop-blur-md">
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
                &times;
              </button>
            </div>
          )}

          <div className="h-full w-full flex flex-col items-center justify-center bg-[#171717]">
            {!currentScan ? (
              <div className="w-full h-full max-w-4xl mx-auto flex flex-col">
                <Scanner onCapture={handleCapture} isProcessing={isProcessing} capturedImage={currentImage} />
              </div>
            ) : (
              <div className="w-full h-full p-4 md:p-6 lg:p-8 flex justify-center overflow-y-auto">
                <div className="w-full max-w-2xl animate-in slide-in-from-bottom-8 fade-in duration-500">
                  <ContactForm
                    initialData={currentScan}
                    imageUrl={currentImage}
                    existingTags={existingTags}
                    onSave={handleSaveContact}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
