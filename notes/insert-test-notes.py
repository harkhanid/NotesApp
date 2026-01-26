#!/usr/bin/env python3
import json
import os
import sys
import requests
import time

# Configuration
API_BASE_URL = "http://localhost:8080/api/notes"
NOTES_FILE = "test-notes-data.json"

def load_notes():
    """Load notes from JSON file"""
    with open(NOTES_FILE, 'r') as f:
        return json.load(f)

def create_note(note_data, token):
    """Create a single note via API"""
    headers = {
        'Content-Type': 'application/json',
        'Cookie': f'token={token}'
    }

    try:
        response = requests.post(API_BASE_URL, json=note_data, headers=headers)
        if response.status_code in [200, 201]:
            result = response.json()
            note_id = result.get('id', 'unknown')
            print(f"✓ Created: {note_data['title'][:50]}... (ID: {note_id})")
            return True
        else:
            print(f"✗ Failed: {note_data['title'][:50]} - Status: {response.status_code}")
            print(f"  Response: {response.text[:100]}")
            return False
    except Exception as e:
        print(f"✗ Error creating {note_data['title'][:50]}: {str(e)}")
        return False

def main():
    # Get JWT token from environment or command line
    token = os.getenv('JWT_TOKEN')
    if not token and len(sys.argv) > 1:
        token = sys.argv[1]

    if not token:
        print("Error: JWT token required")
        print("Usage: python3 insert-test-notes.py <JWT_TOKEN>")
        print("   or: JWT_TOKEN=<token> python3 insert-test-notes.py")
        sys.exit(1)

    # Load notes
    notes = load_notes()
    print(f"Loaded {len(notes)} notes from {NOTES_FILE}")
    print(f"Inserting into {API_BASE_URL}...\n")

    # Insert each note
    success_count = 0
    for i, note in enumerate(notes, 1):
        print(f"[{i}/{len(notes)}] ", end="")
        if create_note(note, token):
            success_count += 1
        time.sleep(0.5)  # Small delay to avoid overwhelming the server

    print(f"\n{'='*60}")
    print(f"Completed: {success_count}/{len(notes)} notes created successfully")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
