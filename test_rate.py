import requests

res = requests.post(
    "http://127.0.0.1:5000/api/games/553850/rate",
    json={"user_id": 1, "stars": 5}
)

print(res.json())
