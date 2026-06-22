use chrono::Utc;
use rand::Rng;

use crate::models::signal::SignalEvent;

pub fn create_mock_signal() -> SignalEvent {
    let mut rng = rand::thread_rng();

    let source = if rng.gen_bool(0.25) {
        "ais".to_string()
    } else {
        "adsb".to_string()
    };

    SignalEvent {
        source,
        altitude: rng.gen_range(0..=40_000),
        speed: rng.gen_range(80..=600),
        heading: rng.gen_range(0..=359),
        signal_strength: rng.gen_range(-85..=-20),
        timestamp: Utc::now(),
    }
}
