use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
};
use std::time::Duration;
use tokio::time::sleep;
use tracing::info;

use crate::services::mock_signal::create_mock_signal;

pub async fn signal_stream(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    info!("client connected to signal stream");

    loop {
        let signal = create_mock_signal();

        let json = match serde_json::to_string(&signal) {
            Ok(value) => value,
            Err(error) => {
                eprintln!("failed to serialize signal: {error}");
                break;
            }
        };

        if socket.send(Message::Text(json.into())).await.is_err() {
            info!("client disconnected from signal stream");
            break;
        }

        sleep(Duration::from_millis(1100)).await;
    }
}
