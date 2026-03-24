use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Instant;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HttpRequestPayload {
    method: String,
    url: String,
    headers: Option<HashMap<String, String>>,
    body: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HttpResponsePayload {
    status: u16,
    duration_ms: u128,
    headers: HashMap<String, String>,
    body: String,
}

#[tauri::command]
async fn send_http(req: HttpRequestPayload) -> Result<HttpResponsePayload, String> {
    if req.url.trim().is_empty() {
        return Err("URL is required.".to_string());
    }

    let method = req
        .method
        .trim()
        .to_uppercase()
        .parse::<reqwest::Method>()
        .map_err(|error| format!("Invalid HTTP method: {error}"))?;

    let url = reqwest::Url::parse(req.url.trim())
        .map_err(|error| format!("Invalid URL. {error}"))?;

    let client = reqwest::Client::new();
    let mut request_builder = client.request(method, url);

    if let Some(headers) = req.headers {
        for (key, value) in headers {
            request_builder = request_builder.header(key, value);
        }
    }

    if let Some(body) = req.body {
        if !body.trim().is_empty() {
            request_builder = request_builder.body(body);
        }
    }

    let started_at = Instant::now();
    let response = request_builder
        .send()
        .await
        .map_err(|error| format!("Request failed. {error}"))?;
    let duration_ms = started_at.elapsed().as_millis();

    let status = response.status().as_u16();
    let mut headers = HashMap::new();
    for (key, value) in response.headers() {
        let value = value
            .to_str()
            .map_or_else(|_| "<non-utf8>".to_string(), ToString::to_string);
        headers.insert(key.to_string(), value);
    }

    let body = response
        .text()
        .await
        .map_err(|error| format!("Cannot read response body. {error}"))?;

    Ok(HttpResponsePayload {
        status,
        duration_ms,
        headers,
        body,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![send_http])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
