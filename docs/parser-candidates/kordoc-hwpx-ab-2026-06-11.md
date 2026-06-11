# Kordoc HWPX Parser Candidate A/B - 2026-06-11

## Candidate

- Package: `kordoc`
- Version: `3.0.1`
- License: `MIT`
- Runtime note: current `kordoc` CLI/API setup expects `pdfjs-dist` in the same environment.

## Same-Sample Fixture

The smoke fixture was generated outside the repo in `/tmp` with `markdownToHwpx()` and then parsed back with both `parse(path)` and `parseHwpx(buffer)`.

Expected clinical/document terms:

- `자궁경부암 병리 결과`
- `편평상피세포암`
- `절제연 음성`
- `혈압 142/88`
- `HbA1c 7.2%`
- `식후혈당 181`
- `의료진에게 확인`

## Result

- HWPX bytes: `23194`
- Detected format: `hwpx`
- `parse(path)`: PASS
- `parseHwpx(buffer)`: PASS
- Expected term hits: `7 / 7`
- Missing terms: none
- `npm install kordoc@3.0.1 pdfjs-dist`: PASS, `0` vulnerabilities reported by npm audit summary

Parsed preview:

```text
CareVault HWPX Parser Fixture

자궁경부암 병리 결과: 편평상피세포암, 절제연 음성.

고혈압 기록: 혈압 142/88 mmHg.

당뇨 기록: HbA1c 7.2%, 식후혈당 181 mg/dL.

다음 진료 질문: 병리결과, 혈압, 혈당 기록을 함께 의료진에게 확인.
```

## Public rhwp Samples

The same `kordoc` installation also parsed public fixtures from `edwardkim/rhwp`:

- `samples/hwp3-sample-hwpx.hwpx`
  - bytes: `108286`
  - detected format: `hwpx`
  - parse: PASS
  - markdown length: `21650`
  - preview begins with `Creating Linux Virtual Servers`
- `samples/basic/KTX.hwp`
  - bytes: `66048`
  - detected format: `hwp`
  - parse: PASS
  - markdown length: `5014`
  - preview begins with `# KTX 노선도`

## Decision

`kordoc` passes the generated HWPX same-sample smoke test and public rhwp HWP/HWPX smoke tests, but this is not enough to adopt it into the CareVault React runtime directly.

Keep it as a candidate until:

- the adapter load path is proven not to bundle Node-only code into the React runtime;
- parser failures are surfaced as filename-reference fallback instead of blocking document storage.

CareVault can separately keep a lightweight browser-side HWPX extractor for preview text and section XML, while treating full HWP binary parsing as a `kordoc` candidate gate.
