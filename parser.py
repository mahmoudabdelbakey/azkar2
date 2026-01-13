
import os
import json
import re

def parse_adhkar_files():
    # Categories mapping
    # Key = Title in text, Value = Key in JSON
    categories_map = {
        "أذكار الصباح": "morning",
        "أذكار المساء": "evening",
        "أذكار بعد السلام من الصلاة المفروضة": "post_prayer",
        "أذكار بعد الصلاة": "post_prayer",
        "تسابيح - تسبيح - السبحة - أذكار عظيمة": "tasbeeh",
        "أذكار النوم والأحلام": "sleep",
        "أذكار الإستيقاظ من النوم": "wake_up",
        "أذكار الصلاة": "prayer",
        "أدعية النَّبِيِّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ": "prophet_duas",
        "جوامع الدعاء": "jawami"
    }

    # Initialize data
    data = {}
    
    # Read files with explicit encoding
    all_lines = []
    # We rely on filenames to order content? Or just read them all and split by title.
    # The user provided separate files, but we know the parser earlier concatenated them wrongly
    # or the previous parser logic failed to detect the title line because of concatenation?
    
    files = sorted([f for f in os.listdir('.') if f.startswith('raw_part') and f.endswith('.txt')])
    
    for f in files:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            # Split lines
            lines = content.splitlines()
            all_lines.extend(lines)
            
    # Process lines
    current_category = None
    buffer = []
    
    # Debug: track line numbers
    for i, line in enumerate(all_lines):
        line = line.strip()
        
        # Check if straight match
        if line in categories_map:
            current_category = categories_map[line]
            if current_category not in data:
                data[current_category] = []
            buffer = []
            print(f"DEBUG: Found Category '{line}' -> {current_category}")
            continue
            
        # If no category yet, skip (or default to something?)
        if not current_category:
            continue
            
        buffer.append(line)
        
        # Check footer pattern
        # The footer is usually:
        # 01
        # 01
        # ID
        # BUT sometimes it might be just 2 numbers? 
        # Looking at raw text:
        # 01
        # 01
        # 1
        
        if len(buffer) >= 3:
            # Check last 3 lines
            l1 = buffer[-1] # ID
            l2 = buffer[-2] # Count
            l3 = buffer[-3] # Count?
            
            # Simple check: are they all digits?
            # Or just last 3 lines are short numbers.
            if l1.isdigit() and l2.isdigit() and l3.isdigit():
                # Found item
                count = int(l3)
                # Meaning text?
                # The text is potentially buffer[:-3]
                # We need to heuristics to separate "Meaning" from "Text"
                # If buffer length > 4, maybe check if buffer[-4] is short or different?
                
                raw_text_parts = buffer[:-3]
                
                # Default separation
                meaning = ""
                text_lines = []
                
                # Heuristic: If there are multiple lines, the LAST line of text is *often* the virtue/meaning/hadith reference
                # UNLESS it's a long Ayah. 
                # Let's check user sample:
                # [Ayah Text]
                # [Reference / Virtues]
                # 01
                # 01
                # 1
                
                if len(raw_text_parts) > 1:
                    # Assume last line is meaning
                    meaning = raw_text_parts[-1]
                    text_lines = raw_text_parts[:-1]
                    
                    # But wait, what if the text itself is multiline and no meaning? 
                    # E.g. Ayah text is 3 lines. References often start with "من قالها" or "Muslim" or brackets [].
                    # Let's look for keywords in the last line to confirm it is a meaning.
                    
                    keywords = ['من قال', 'رواه', 'أخرجه', 'فضلها', 'آية الكرسي', 'سورة', 'كانت له', 'كتبت له']
                    is_meaning = False
                    if any(k in meaning for k in keywords) or (meaning.startswith('[') and meaning.endswith(']')):
                        is_meaning = True
                    
                    if not is_meaning and len(meaning) > 50:
                         # Longer text might just be part of the dua
                         # But usually "Meaning/Virtue" is distinct.
                         # Let's keep the split for now as requested "Verse color" vs "Hadith color"
                         pass
                    
                    # If we decide it's NOT a meaning line, merge it back?
                    # No, user explicitly wants "Hadith color" for the explanation parts.
                    # Most Adhkar have a virtue listed last.
                    
                elif len(raw_text_parts) == 1:
                    text_lines = raw_text_parts
                    meaning = "ذكر"
                else:
                    text_lines = [""]
                    
                text = "\n".join(text_lines)
                
                item = {
                    "id": f"{current_category}_{len(data[current_category])}",
                    "text": text,
                    "meaning": meaning,
                    "count": count
                }
                
                data[current_category].append(item)
                buffer = [] # Reset

    # Write data.js
    js_content = f"const adhkarData = {json.dumps(data, ensure_ascii=False, indent=4)};"
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Parsing complete. Categories found: {list(data.keys())}")
    for k, v in data.items():
        print(f" - {k}: {len(v)} items")

if __name__ == "__main__":
    parse_adhkar_files()
