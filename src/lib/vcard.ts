import { Contact } from "../types";
import { Capacitor } from "@capacitor/core";

export async function downloadVCard(contact: Contact) {
  const vcard = `BEGIN:VCARD
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

  const fileName = `${contact.firstName || 'Contact'}_${contact.lastName || ''}.vcf`.trim();

  // On native Android/iOS, use the Web Share API with a File object.
  // This triggers the OS share sheet which lets the user save to Contacts, Files, etc.
  if (Capacitor.isNativePlatform() && navigator.share) {
    try {
      const file = new File([vcard], fileName, { type: 'text/vcard' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName });
        return;
      }
    } catch (e) {
      // User cancelled share or share failed — don't throw
      console.error('Share failed:', e);
      return;
    }
  }

  // Web fallback: anchor-based download
  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
