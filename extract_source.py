import json
import base64
import urllib.request
import re

url = "http://localhost:3000/src/App.tsx"
req = urllib.request.Request(url)
response = urllib.request.urlopen(req)
html = response.read().decode('utf-8')

match = re.search(r'sourceMappingURL=data:application/json(?:;charset=[^;]+)?;base64,(.*)', html)
if match:
    b64_data = match.group(1)
    json_str = base64.b64decode(b64_data).decode('utf-8')
    data = json.loads(json_str)
    sources = data.get('sourcesContent', [])
    if sources:
        with open('src/App_recovered.tsx', 'w', encoding='utf-8') as f:
            f.write(sources[0])
        print("Recovered src/App.tsx!")
    else:
        print("No sourcesContent found.")
else:
    print("No source map found.")
