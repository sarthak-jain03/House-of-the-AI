import os
import requests
from dotenv import load_dotenv

load_dotenv()

FIREWORKS_API_KEY = "fw_3ZWoZGGVnp9kZtpSjoKutYdj"
FIREWORKS_URL = "https://api.fireworks.ai/inference/v1/chat/completions"

MODEL = "accounts/fireworks/models/deepseek-v3p2"
def test_model():
    headers = {
        "Authorization": f"Bearer {FIREWORKS_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are a poet. Respond with a short poem."},
            {"role": "user", "content": "Write a 4 line poem about the moon."}
        ],
        "temperature": 0.7,
        "max_tokens": 200
    }

    print("🚀 Testing Fireworks model")
    print("MODEL:", MODEL)

    r = requests.post(FIREWORKS_URL, headers=headers, json=payload, timeout=30)

    print("HTTP STATUS:", r.status_code)
    data = r.json()

    print("\n🔍 FULL RESPONSE:")
    print(data)

    msg = data.get("choices", [{}])[0].get("message", {})

    content = (
        msg.get("content")
        or msg.get("reasoning_content")
        or ""
    )

    print("\n✨ MODEL OUTPUT:")
    print(content if content else "[EMPTY RESPONSE]")


if __name__ == "__main__":
    test_model()