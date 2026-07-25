import glob
import re

files = glob.glob('d:/chuẩn CTTN/*.html')

for filepath in files:
    if 'quanly.html' in filepath:
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Bump CSS to home.css?v=82
    content = re.sub(r'href=["\']home\.css(?:\?v=\d+)?["\']', 'href="home.css?v=82"', content)

    # 2. Bump JS to home.js?v=82
    content = re.sub(r'src=["\']home\.js(?:\?v=\d+)?["\']', 'src="home.js?v=82"', content)

    # 3. If leaflet is imported in head AND at the bottom, remove the one at the bottom
    head_match = re.search(r'<head>.*?</head>', content, re.DOTALL)
    if head_match and 'leaflet.js' in head_match.group(0):
        content = re.sub(
            r'<script src=["\']https://unpkg\.com/leaflet@1\.9\.4/dist/leaflet\.js["\'].*?</script>\s*<script src=["\']thanh_an_geo\.js["\']></script>',
            '',
            content,
            flags=re.DOTALL
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Finished
