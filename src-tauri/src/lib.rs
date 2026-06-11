use std::path::Path;

use serde::Serialize;
use tauri_plugin_sql::{Migration, MigrationKind};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ParsedHwpAttachmentText {
    text: String,
    source_label: &'static str,
    character_count: usize,
}

fn normalize_hwp_attachment_text(text: &str) -> String {
    text.replace('\0', "")
        .replace("\r\n", "\n")
        .replace('\r', "\n")
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

fn extract_hwp_attachment_text_from_path(path: &Path) -> Result<ParsedHwpAttachmentText, String> {
    let text = hwarang::extract_text_from_file(path)
        .map_err(|error| format!("HWP parser failed: {error}"))?;
    let normalized = normalize_hwp_attachment_text(&text);
    if normalized.is_empty() {
        return Err("HWP parser returned no readable text".into());
    }

    Ok(ParsedHwpAttachmentText {
        character_count: normalized.chars().count(),
        source_label: "HWP/HWPX 데스크톱 파서",
        text: normalized,
    })
}

#[tauri::command]
fn parse_hwp_attachment_text(path: String) -> Result<ParsedHwpAttachmentText, String> {
    extract_hwp_attachment_text_from_path(Path::new(&path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_app_state",
        sql: "CREATE TABLE IF NOT EXISTS app_state (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );",
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:carevault.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![parse_hwp_attachment_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::process::Command;

    fn hwp_sample_terms_from_env(default_terms: &str) -> Vec<String> {
        std::env::var("CAREVAULT_HWP_SAMPLE_TERMS")
            .unwrap_or_else(|_| default_terms.into())
            .split(',')
            .map(str::trim)
            .filter(|term| !term.is_empty())
            .map(str::to_owned)
            .collect()
    }

    fn hwp_sample_min_chars_from_env(default_min_chars: usize) -> usize {
        std::env::var("CAREVAULT_HWP_SAMPLE_MIN_CHARS")
            .ok()
            .and_then(|value| value.trim().parse::<usize>().ok())
            .unwrap_or(default_min_chars)
    }

    fn assert_hwp_sample_parse(
        parsed: &ParsedHwpAttachmentText,
        sample_label: &str,
        min_chars: usize,
        expected_terms: &[String],
    ) {
        assert_eq!(parsed.source_label, "HWP/HWPX 데스크톱 파서");
        assert!(
            parsed.character_count >= min_chars,
            "{sample_label} should produce at least {min_chars} chars, got {} chars",
            parsed.character_count
        );
        expected_terms.iter().for_each(|term| {
            assert!(
                parsed.text.contains(term),
                "{sample_label} is missing expected term: {term}"
            );
        });
    }

    #[test]
    fn normalizes_hwp_attachment_text_for_local_search() {
        let text =
            normalize_hwp_attachment_text("\0  자궁경부암 병리 결과\r\n\r\n 혈압 142/88  \r");

        assert_eq!(text, "자궁경부암 병리 결과\n혈압 142/88");
    }

    #[test]
    fn hwp_parser_command_fails_closed_for_missing_files() {
        let result = extract_hwp_attachment_text_from_path(Path::new(
            "/tmp/carevault-missing-hwp-fixture.hwp",
        ));

        assert!(result.is_err());
    }

    #[test]
    fn hwp_parser_command_parses_external_sample_when_env_is_set() {
        let Ok(url) = std::env::var("CAREVAULT_HWP_SAMPLE_URL") else {
            eprintln!("skipping external HWP sample test: CAREVAULT_HWP_SAMPLE_URL is not set");
            return;
        };
        let expected_terms = hwp_sample_terms_from_env("KTX 노선도,서울,용산,광명");
        let min_chars = hwp_sample_min_chars_from_env(1000);
        let sample_path = std::env::temp_dir().join(format!(
            "carevault-hwp-command-sample-{}.hwp",
            std::process::id()
        ));

        let status = Command::new("curl")
            .arg("-fsSL")
            .arg(&url)
            .arg("-o")
            .arg(&sample_path)
            .status()
            .expect("curl must be available for the explicit external HWP sample test");
        assert!(status.success(), "failed to download HWP sample from {url}");

        let parsed = parse_hwp_attachment_text(sample_path.to_string_lossy().into_owned())
            .expect("external HWP sample should parse through the Tauri command boundary");
        let _ = std::fs::remove_file(&sample_path);

        assert_hwp_sample_parse(&parsed, "external HWP sample", min_chars, &expected_terms);
    }

    #[test]
    fn hwp_parser_command_parses_private_sample_when_env_is_set() {
        let Ok(path) = std::env::var("CAREVAULT_HWP_SAMPLE_PATH") else {
            eprintln!(
                "skipping private HWP/HWPX sample test: CAREVAULT_HWP_SAMPLE_PATH is not set"
            );
            return;
        };
        let sample_path = Path::new(&path);
        assert!(
            sample_path.is_file(),
            "CAREVAULT_HWP_SAMPLE_PATH must point to a readable file"
        );

        let parsed = parse_hwp_attachment_text(sample_path.to_string_lossy().into_owned())
            .expect("private HWP/HWPX sample should parse through the Tauri command boundary");
        let expected_terms = hwp_sample_terms_from_env("");
        let min_chars = hwp_sample_min_chars_from_env(100);

        assert_hwp_sample_parse(
            &parsed,
            "private HWP/HWPX sample",
            min_chars,
            &expected_terms,
        );
    }
}
