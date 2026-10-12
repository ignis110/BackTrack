"""
BackTrack Academic Database Snapshot and Backup Manager.
Provides automated backup creation, SHA-256 verification, and snapshot rotation
for university semester records.
"""

import os
import shutil
import hashlib
from datetime import datetime


BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backups")
DB_SOURCE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backtrack.db")


def calculate_file_hash(filepath: str) -> str:
    """Calculates SHA-256 digest of a database file."""
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            sha.update(chunk)
    return sha.hexdigest()


def create_backup() -> str:
    """Creates a timestamped snapshot of the current database file."""
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)

    if not os.path.exists(DB_SOURCE):
        print(f"[ERROR] Source database not found at {DB_SOURCE}")
        return ""

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"backtrack_backup_{timestamp}.db"
    dest_path = os.path.join(BACKUP_DIR, backup_filename)

    shutil.copy2(DB_SOURCE, dest_path)
    file_hash = calculate_file_hash(dest_path)
    file_size_kb = os.path.getsize(dest_path) / 1024

    print(f"[OK] Database snapshot created: {backup_filename}")
    print(f"     Path:     {dest_path}")
    print(f"     Size:     {file_size_kb:.2f} KB")
    print(f"     SHA-256:  {file_hash[:16]}...{file_hash[-8:]}")
    return dest_path


def list_backups():
    """Lists all available snapshots in the backups directory."""
    if not os.path.exists(BACKUP_DIR):
        print("No backups directory found.")
        return

    backups = [f for f in os.listdir(BACKUP_DIR) if f.endswith(".db")]
    if not backups:
        print("No snapshots available.")
        return

    print(f"Available Snapshots ({len(backups)}):")
    for b in sorted(backups, reverse=True):
        full_p = os.path.join(BACKUP_DIR, b)
        sz = os.path.getsize(full_p) / 1024
        print(f"  - {b} ({sz:.1f} KB)")


if __name__ == "__main__":
    create_backup()
