import websocket
import time
import json

t = 0
c = 0

# Replace with your actual JWT token
JWT_TOKEN = "eyJ1c2VyIjoiZHJvbmUtY2xpZW50LTEiLCJyb2xlIjoidGVsZW1ldHJ5LXNlbmRlciIsImFsZyI6IkhTMjU2In0.eyJ1c2VyIjoiZHJvbmUtY2xpZW50LTEiLCJyb2xlIjoidGVsZW1ldHJ5LXNlbmRlciJ9.0HpwNedoKcfE1y4Oso1oowYExtNqEqqb6_CfYHXV0Vg"

def send_telemetry():
    # Include the JWT as a subprotocol
    ws = websocket.WebSocket()
    ws.connect("wss://websocket-server-zpjf.onrender.com", subprotocols=[JWT_TOKEN])

    while True:
        write_data()
        with open('SDR_data.json', 'r') as file:
            data = json.load(file)      
        ws.send(json.dumps(data))
        time.sleep(1)

def write_data():
    global t, c
    t += 1
    c += 2.5
    data = {
        "altitude": t,
        "battery": c,
        "Drone": 1
    }
    with open('SDR_data.json', 'w') as file:
        json.dump(data, file, indent=4)

send_telemetry()
