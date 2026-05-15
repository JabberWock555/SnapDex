import { Contact } from "../types";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

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

export async function downloadVCard(contact: Contact): Promise<void> {
  const vcard = buildVCardString(contact);
  const fileName = `${contact.firstName || 'Contact'}_${contact.lastName || ''}.vcf`.trim();

  if (Capacitor.isNativePlatform()) {
    // Write to a temp file then share via native Android/iOS share sheet.
    // Android recognises .vcf files and offers "Add to Contacts" as a target.
    try {
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: vcard,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: `Save contact: ${contact.firstName} ${contact.lastName}`.trim(),
        url: writeResult.uri,
        dialogTitle: 'Save to Contacts',
      });
    } catch (e) {
      console.error('Native share failed:', e);
    }
    return;
  }

  // Web fallback: anchor-based download
  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
