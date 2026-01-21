#!/bin/bash

# Check if JWT_TOKEN is set
if [ -z "$JWT_TOKEN" ]; then
    echo "Error: JWT_TOKEN environment variable not set"
    echo "Usage: JWT_TOKEN=<your-token> ./insert-test-notes.sh"
    exit 1
fi

API_URL="http://localhost:8080/api/notes"
NOTES_FILE="test-notes-data.json"

echo "Inserting notes from $NOTES_FILE..."
echo "================================================"

# Count total notes
TOTAL=$(cat $NOTES_FILE | python3 -c "import json, sys; print(len(json.load(sys.stdin)))")
echo "Total notes to insert: $TOTAL"
echo ""

SUCCESS=0
FAILED=0

# Read JSON array and process each note
cat $NOTES_FILE | python3 -c "
import json, sys
notes = json.load(sys.stdin)
for i, note in enumerate(notes):
    print(f'{i}|||{json.dumps(note)}')
" | while IFS='|||' read -r index note_json; do
    INDEX=$((index + 1))
    TITLE=$(echo "$note_json" | python3 -c "import json, sys; print(json.load(sys.stdin)['title'][:50])")

    echo -n "[$INDEX/$TOTAL] Creating: $TITLE... "

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "Cookie: token=$JWT_TOKEN" \
        -d "$note_json")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        NOTE_ID=$(echo "$BODY" | python3 -c "import json, sys; print(json.load(sys.stdin).get('id', 'unknown'))" 2>/dev/null || echo "unknown")
        echo "✓ (ID: $NOTE_ID)"
        ((SUCCESS++))
    else
        echo "✗ (Status: $HTTP_CODE)"
        ((FAILED++))
    fi

    sleep 0.3
done

echo ""
echo "================================================"
echo "Completed: $SUCCESS/$TOTAL notes created successfully"
if [ $FAILED -gt 0 ]; then
    echo "Failed: $FAILED notes"
fi
echo "================================================"
