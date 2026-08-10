import json

files_to_revert = [
    "src/app/globals.css",
    "src/app/layout.tsx",
    "src/app/(app)/layout.tsx",
    "src/app/(app)/page.tsx"
]

file_contents = {}

with open('/Users/harshithgowda/.gemini/antigravity-ide/brain/25b2e647-de08-44a2-8433-566d4ba955c6/.system_generated/logs/transcript_full.jsonl', 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'VIEW_FILE' or data.get('type') == 'TOOL_RESPONSE':
            # Actually, tool responses have 'name': 'view_file' in the 'content' sometimes? 
            # Let's just look for the text "File Path: `file:///...`"
            content = data.get('content', '')
            if 'File Path: `file://' in content:
                for f_name in files_to_revert:
                    if f_name in content and f_name not in file_contents:
                        # Extract the lines
                        lines = content.split('\n')
                        original_lines = []
                        start_parsing = False
                        for l in lines:
                            if l.startswith('The following code has been modified'):
                                start_parsing = True
                                continue
                            if start_parsing:
                                if l.startswith('The above content shows'):
                                    break
                                # format is "1: code..."
                                parts = l.split(': ', 1)
                                if len(parts) == 2 and parts[0].isdigit():
                                    original_lines.append(parts[1])
                                else:
                                    # Might be a line without colon space?
                                    if ': ' in l:
                                        original_lines.append(l.split(': ', 1)[1])
                                    else:
                                        original_lines.append(l)
                        
                        file_contents[f_name] = '\n'.join(original_lines)
                        print(f"Captured {f_name}")

for name, content in file_contents.items():
    with open(f"/Users/harshithgowda/Desktop/cora/{name}", 'w') as out:
        out.write(content)
    print(f"Restored {name}")

