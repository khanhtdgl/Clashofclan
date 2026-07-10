import json
import os
import requests
from datetime import timedelta

# Lấy token và chat_id từ GitHub Secrets (đã thiết lập trong Settings của repo)
BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

def send_telegram(msg):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    requests.post(url, data={'chat_id': CHAT_ID, 'text': msg, 'parse_mode': 'Markdown'})

try:
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    report = "📋 *TIẾN ĐỘ NÂNG CẤP CLASH OF CLANS*\n\n"
    
    # Xử lý Buildings
    buildings = [b for b in data.get('buildings', []) if 'timer' in b and b['timer'] > 0]
    
    if buildings:
        for b in buildings:
            time_left = str(timedelta(seconds=b['timer']))
            report += f"• Công trình ID `{b['data']}` (LVL {b['lvl']}): `{time_left}`\n"
    else:
        report += "• Hiện không có công trình nào đang nâng cấp.\n"

    send_telegram(report)
except Exception as e:
    print(f"Lỗi: {e}")
