import { Contact } from "../types";
import { Capacitor } from "@capacitor/core";
import { Contacts, PhoneType, EmailType, PostalAddressType } from "@capacitor-community/contacts";

export async function saveToDeviceContacts(contact: Contact): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // Check existing grant before triggering a dialog (avoids hung permission prompts)
  const permStatus = await Contacts.checkPermissions();
  if (permStatus.contacts !== 'granted') {
    const result = await Contacts.requestPermissions();
    if (result.contacts !== 'granted') {
      throw new Error("Contacts permission denied. Please enable it in Settings > Apps > SnapDex > Permissions.");
    }
  }

  await Contacts.createContact({
    contact: {
      name: {
        given: contact.firstName || null,
        family: contact.lastName || null,
      },
      organization: {
        company: contact.company || null,
        jobTitle: contact.jobTitle || null,
      },
      phones: contact.phone
        ? [{ type: PhoneType.Work, label: 'Work', number: contact.phone }]
        : [],
      emails: contact.email
        ? [{ type: EmailType.Work, label: 'Work', address: contact.email }]
        : [],
      urls: contact.website ? [contact.website] : [],
      postalAddresses: contact.address
        ? [{ type: PostalAddressType.Work, label: 'Work', street: contact.address }]
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
