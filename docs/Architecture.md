# Architektur (NativeScript Task Manager)

## Ziel
Ziel ist die Entwicklung einer offline-fähigen Task-Management-App mit NativeScript Core und TypeScript.
Die Anwendung folgt einem MVVM-Ansatz und einer klaren Schichtenarchitektur (Domain, Data, Services, UI).

## Architekturüberblick
Die Applikation ist in folgende Schichten aufgeteilt:

- **UI (`app/ui`)**: Pages (XML) und dazugehörige Page-Controller sowie ViewModels
- **Services (`app/services`)**: Geschäftslogik (Use-Cases), Validierung, Orchestrierung
- **Data (`app/data`)**: Repositories, SQLite-Zugriff, Synchronisationsvorbereitung
- **Domain (`app/domain`)**: Domänenmodelle und Enums

## MVVM ohne Framework
NativeScript Core wird ohne Angular/Vue/React eingesetzt. MVVM wird wie folgt umgesetzt:

- **View**: `*.page.xml` (UI Layout)
- **ViewController**: `*.page.ts` (Events, Navigation, Binding)
- **ViewModel**: `*.vm.ts` (State + Actions, keine direkte DB-Abhängigkeit)
- **Model**: `app/domain/*` (Task, Status, Priority)

## Komponenten-Diagramm (Text)
UI (Pages/ViewModels)
  -> Services (TaskService)
    -> Data (TaskRepository Interface)
      -> SQLite Repository (SqliteTaskRepository)
        -> SQLite DB (lokale Persistenz)

## Datenfluss (typischer Use-Case: Task erstellen)
1. User interagiert mit der View (Create/Edit Page)
2. View löst Action im ViewModel aus
3. ViewModel ruft den Service (TaskService) auf
4. TaskService validiert und erstellt ein Task-Objekt (Domain)
5. TaskService ruft TaskRepository.create(task) auf
6. Repository persistiert Daten lokal (SQLite, offline-first)
7. ViewModel aktualisiert State, View reflektiert Änderung via Binding

## Offline-first & Synchronisationsvorbereitung
Alle Änderungen werden lokal gespeichert. Zusätzlich wird eine Synchronisationskomponente vorgesehen:
- **SyncQueue** (geplante Tabelle / Queue): speichert Änderungen (create/update/delete) als Events
- **SyncService (Stub)**: verarbeitet Queue sobald Connectivity vorhanden ist (späterer Ausbau)

## Qualitätsziele (nicht-funktional)
- Offline-Fähigkeit
- Wartbarkeit durch klare Schichten
- Testbarkeit (Services und Repositories separat testbar)
- Erweiterbarkeit (spätere Backend-Synchronisation)
