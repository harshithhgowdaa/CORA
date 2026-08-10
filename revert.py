import json

files_to_revert = [
    "src/app/globals.css",
    "src/app/layout.tsx",
    "src/app/(app)/layout.tsx",
    "src/app/(app)/page.tsx"
]

reverted = {f: False for f in files_to_revert}

with open('/Users/harshithgowda/.gemini/antigravity-ide/brain/25b2e647-de08-44a2-8433-566d4ba955c6/.system_generated/logs/transcript_full.jsonl', 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'PLANNER_RESPONSE':
            tool_calls = data.get('tool_calls', [])
            for call in tool_calls:
                if call['name'] == 'replace_file_content' or call['name'] == 'multi_replace_file_content':
                    args = call['args']
                    target = args.get('TargetFile', '')
                    for f_name in files_to_revert:
                        if target.endswith(f_name) and not reverted[f_name]:
                            print(f"Found original for {f_name}")
                            # The target content represents what was in the file BEFORE replacement
                            # But wait, what if it was multiple replacements?
                            # If it's the very first time the file is edited for the redesign, TargetContent is what we want.
                            # We can print it out to a file
                            with open(f_name.replace('/', '_') + '_original.txt', 'w') as out:
                                if 'TargetContent' in args:
                                    out.write(args['TargetContent'])
                                else:
                                    out.write(json.dumps(args))
                            # But wait, replace_file_content only targets a CHUNK of the file.
                            # So I can't just write TargetContent.
                            pass

