#!/usr/bin/env python3
"""
Google Drive uploader for SnapDex debug APKs.
Targets the "App Testing" folder — deletes existing APK, uploads new one.

Uses a service account (no browser OAuth needed):
  1. Google Cloud Console → IAM & Admin → Service Accounts → Create
  2. Keys tab → Add Key → JSON → download
  3. Share the "App Testing" Drive folder with the service account email (Editor)
  4. Place the key JSON at scripts/service_account.json
  5. Run: python3 scripts/gdrive_upload.py <path/to/apk>
"""

import sys
import argparse
from pathlib import Path

SCRIPTS_DIR = Path(__file__).parent
SA_FILE = SCRIPTS_DIR / "service_account.json"
FOLDER_NAME = "App Testing"


def get_drive_service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    if not SA_FILE.exists():
        print(f"ERROR: Service account key not found at {SA_FILE}")
        print()
        print("Setup steps:")
        print("  1. Google Cloud Console → IAM & Admin → Service Accounts → Create Service Account")
        print("  2. Click the service account → Keys → Add Key → Create new key → JSON → Download")
        print("  3. Save the downloaded file as:  scripts/service_account.json")
        print("  4. In Google Drive, share the 'App Testing' folder with the service account email")
        print("     (Editor access)")
        sys.exit(1)

    creds = service_account.Credentials.from_service_account_file(
        str(SA_FILE),
        scopes=["https://www.googleapis.com/auth/drive"]
    )
    return build("drive", "v3", credentials=creds)


def find_folder(service, name):
    results = service.files().list(
        q=f"mimeType='application/vnd.google-apps.folder' and name='{name}' and trashed=false",
        spaces="drive",
        fields="files(id, name)"
    ).execute()
    files = results.get("files", [])
    return files[0]["id"] if files else None


def delete_apks_in_folder(service, folder_id):
    results = service.files().list(
        q=f"'{folder_id}' in parents and name contains '.apk' and trashed=false",
        spaces="drive",
        fields="files(id, name)"
    ).execute()
    files = results.get("files", [])
    for f in files:
        service.files().delete(fileId=f["id"]).execute()
        print(f"  Deleted: {f['name']}")
    return len(files)


def upload_apk(service, folder_id, apk_path: Path):
    from googleapiclient.http import MediaFileUpload

    media = MediaFileUpload(
        str(apk_path),
        mimetype="application/vnd.android.package-archive",
        resumable=True
    )
    file_metadata = {"name": apk_path.name, "parents": [folder_id]}
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id, name, webViewLink"
    ).execute()
    return file


def main():
    parser = argparse.ArgumentParser(description="Upload APK to Google Drive 'App Testing' folder")
    parser.add_argument("apk_path", help="Path to the APK file to upload")
    args = parser.parse_args()

    apk_path = Path(args.apk_path)
    if not apk_path.exists():
        print(f"ERROR: APK not found at {apk_path}")
        sys.exit(1)

    print("Connecting to Google Drive (service account)...")
    service = get_drive_service()

    print(f"Finding '{FOLDER_NAME}' folder in Drive...")
    folder_id = find_folder(service, FOLDER_NAME)
    if not folder_id:
        print(f"ERROR: Folder '{FOLDER_NAME}' not found.")
        print("Make sure the folder exists in Drive and is shared with the service account.")
        sys.exit(1)

    print(f"Deleting existing APKs from '{FOLDER_NAME}'...")
    deleted = delete_apks_in_folder(service, folder_id)
    if deleted == 0:
        print("  (none found)")

    print(f"Uploading {apk_path.name}...")
    result = upload_apk(service, folder_id, apk_path)
    print(f"  Uploaded: {result['name']}")
    print(f"  View: {result.get('webViewLink', 'N/A')}")
    print("Done.")


if __name__ == "__main__":
    main()
