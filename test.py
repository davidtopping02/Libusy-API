import requests

BASE = "http://127.0.0.1:5000/"
# response = requests.get(BASE + "sensors")
# print(response.json())

response = requests.get(BASE + "occupancy")
print(response.json())
