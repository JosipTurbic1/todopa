# Aufgabenmanagement App (NativeScript)

## Übersicht
Diese Anwendung ist eine hybride mobile -App, die mit NativeScript Core und TypeScript entwickelt wurde.
Der Fokus liegt auf moderner Softwarearchitektur, Offline-Fähigkeit und sauberer Trennung der Verantwortlichkeiten (MVVM).

Die App dient als Grundlage für die Programmiererarbeit sowie für die Transferarbeit im CAS
„Modern Software Engineering and Development“ an der HSLU.

---

## Funktionalitäten
- Aufgaben erstellen, bearbeiten und löschen
- Statusverwaltung (To Do / In Progress / Done)
- Detailansicht für einzelne Aufgaben
- Verwaltung von Deadlines und Prioritäten
- Lokale Speicherung der Daten (Offline-first)
- Vorbereitung für spätere Backend-Synchronisation

---

## Technologie-Stack
- NativeScript Core
- TypeScript
- SQLite (lokale Datenspeicherung)
- MVVM-Architektur
- Offline-first Ansatz

---

## Projektstruktur
Die Anwendung ist in klar getrennte Schichten unterteilt:

- `app/domain` – Domänenmodelle und Enums
- `app/data` – Datenzugriff, Repositories, SQLite
- `app/services` – Geschäftslogik
- `app/ui` – UI-Seiten und ViewModels
- `docs` – Architektur- und Testdokumentation
- `app/__tests__` – Unit- und Integrationstests

---

## Architektur
Eine detaillierte Beschreibung der Architektur befindet sich in der Datei  
[`docs/Architecture.md`](docs/Architecture.md).

---

## Testing
Die Teststrategie sowie Testfälle sind dokumentiert in  
[`docs/Test.md`](docs/Test.md).

---

## Anwendung starten

### iOS
```bash
ns run ios --hmr
