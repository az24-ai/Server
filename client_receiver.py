import websocket


JWT_TOKEN = "RF_Payload_Project"

def on_message(ws, message):
    print("Received from server:", message)

ws = websocket.WebSocketApp(
    "wss://websocket-server-zpjf.onrender.com",
    on_message=on_message,
    subprotocols=[JWT_TOKEN]  
)

ws.run_forever()
