use chrono::{DateTime, Utc};
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignalEvent {
    pub source: String,
    pub altitude: u32,
    pub speed: u32,
    pub heading: u32,
    pub signal_strength: i32,
    pub timestamp: DateTime<Utc>,
}
