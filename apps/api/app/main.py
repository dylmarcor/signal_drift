import asyncio
import random
from datetime import datetime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Signal Drift API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


def create_mock_signal():
    source = "ais" if random.random() > 0.75 else "adsb"

    return {
        "source": source,
        "altitude": random.randint(0, 40000),
        "speed": random.randint(80, 600),
        "heading": random.randint(0, 359),
        "signalStrength": random.randint(-85, -20),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.websocket("/ws/signals")
async def signal_stream(websocket: WebSocket):
    await websocket.accept()
    print("Client connected to signal stream")

    try:
        while True:
            signal = create_mock_signal()
            await websocket.send_json(signal)
            await asyncio.sleep(1.1)

    except WebSocketDisconnect:
        print("Client disconnected from signal stream")

    except Exception as error:
        print(f"Unexpected WebSocket error: {error}")