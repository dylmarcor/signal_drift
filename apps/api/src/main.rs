mod models;
mod routes;
mod services;

use axum::{
    routing::get,
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

use routes::health::health;
use routes::signals::signal_stream;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/ws/signals", get(signal_stream))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000")
        .await
        .expect("failed to bind to port 8000");

    info!("Signal Drift API listening on http://localhost:8000");

    axum::serve(listener, app)
        .await
        .expect("server failed");
}
