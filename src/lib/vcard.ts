import { Contact } from "../types";

export function downloadVCard(contact: Contact) {
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

  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `${contact.firstName || 'Contact'}_${contact.lastName || ''}.vcf`.trim();
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
