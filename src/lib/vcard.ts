import { Contact } from "../types";
import { Capacitor } from "@capacitor/core";
import { Contacts, PhoneType, EmailType } from "@capacitor-community/contacts";

export async function saveToDeviceContacts(contact: Contact): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // Request permission first
  const { granted } = await Contacts.requestPermissions();
  if (!granted) {
    throw new Error("Contacts permission denied.");
  }

  await Contacts.createContact({
    contact: {
      givenName: contact.firstName || undefined,
      familyName: contact.lastName || undefined,
      organizationName: contact.company || undefined,
      jobTitle: contact.jobTitle || undefined,
      phones: contact.phone
        ? [{ type: PhoneType.Work, label: 'Work', number: contact.phone }]
        : [],
      emails: contact.email
        ? [{ type: EmailType.Work, label: 'Work', address: contact.email }]
        : [],
      urls: contact.website ? [{ url: contact.website }] : [],
      postalAddresses: contact.address
        ? [{ label: 'Work', fullAddress: contact.address }]
        : [],
    },
  });
}

export async function downloadVCard(contact: Contact): Promise<void> {
  const vcard = buildVCardString(contact);
  const fileName = `${contact.firstName || 'Contact'}_${contact.lastName || ''}.vcf`.trim();

  // Web fallback: anchor-based download
  const blob = new Blob([vcard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildVCardString(contact: Contact): string {
  return `BEGIN:VCARD
VERSION:3.0
N:${contact.lastName || ''};${contact.firstName || ''};;;
FN:${contact.firstName || ''} ${contact.lastName || ''}
ORG:${contact.company || ''}
TITLE:${contact.jobTitle || ''}
TEL;TYPE=WORK,VOICE:${contact.phone || ''}
EMAIL;TYPE=WORK:${contact.email || ''}
URL:${contact.website || ''}
ADR;TYPE=WORK:;;${contact.address || ''};;;;
END:VCARD`;
}
