import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Contact } from '../types';

const contactsRef = (uid: string) => collection(db, 'users', uid, 'contacts');

export async function loadContacts(uid: string): Promise<Contact[]> {
  const q = query(contactsRef(uid), orderBy('scanDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data() as Contact);
}

export async function saveContact(uid: string, contact: Contact): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'contacts', contact.id), contact);
}

export async function deleteContact(uid: string, contactId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'contacts', contactId));
}
