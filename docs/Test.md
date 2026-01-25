# Testdokumentation

## 1. Überblick
Diese Testdokumentation beschreibt die manuell durchgeführten Tests der Benutzeroberfläche
sowie die automatisierten Unit Tests der Geschäftslogik und der Datenzugriffsschicht.

Ziel ist es sicherzustellen, dass:
- die App funktional korrekt arbeitet,
- alle Kernfunktionen offline verfügbar sind,
- die Geschäftslogik und Persistenz testbar und stabil implementiert sind.

---

## 2. Testumgebung

### Manuelle Tests
- Plattform: iOS Simulator (primär), Android Emulator (optional)
- App: NativeScript Core + TypeScript
- Persistenz: SQLite (lokale Datenbank)
- Architektur: MVVM
- Offline-First: Alle Änderungen werden lokal gespeichert

### Automatisierte Tests
- Test-Framework: Jest
- Getestete Schichten:
  - Service Layer (`TaskService`)
  - Data Layer (`SqliteTaskRepository`)
- Externe Abhängigkeiten (SQLite, AppContainer) werden gemockt

---

## 3. Testdaten
- Beispielaufgabe:
  - Titel: „Einkaufen“
  - Priorität: High
  - Deadline: gesetzt
  - Status: To Do

---

## 4. Manuelle Testfälle (UI & User Flows)

### TC-01: Aufgabe erstellen
**Vorbedingung:** App gestartet  
**Schritte:**
1. Auf „+“ klicken
2. Titel eingeben
3. Priorität wählen
4. Speichern  

**Erwartet:**
- Aufgabe erscheint in der Aufgabenliste
- App stürzt nicht ab

---

### TC-02: Aufgabe bearbeiten
**Vorbedingung:** Es existiert eine Aufgabe  

**Schritte:**
1. Aufgabe öffnen
2. „Bearbeiten“ klicken
3. Titel ändern
4. Speichern  

**Erwartet:**
- Änderungen sind in der Liste und in der Detailansicht sichtbar

---

### TC-03: Status ändern
**Vorbedingung:** Aufgabe existiert  

**Schritte:**
1. Aufgabe öffnen
2. Status auf „In Progress“ ändern
3. Status auf „Done“ ändern  

**Erwartet:**
- Status wird sofort aktualisiert
- Nach App-Neustart bleibt der Status erhalten

---

### TC-04: Aufgabe löschen
**Vorbedingung:** Aufgabe existiert  

**Schritte:**
1. Aufgabe öffnen
2. „Löschen“ klicken
3. Löschvorgang bestätigen  

**Erwartet:**
- Aufgabe verschwindet aus der Liste
- Nach App-Neustart bleibt sie gelöscht

---

### TC-05: Sortierung (Priorität & Deadline)
**Vorbedingung:** Mehrere Aufgaben mit unterschiedlichen Prioritäten und Deadlines  

**Erwartet:**
- High vor Medium vor Low
- Bei gleicher Priorität: frühere Deadline zuerst
- Aufgaben ohne Deadline erscheinen am Ende der Liste

---

### TC-06: Overdue-Anzeige
**Vorbedingung:** Aufgabe mit Deadline in der Vergangenheit und Status ≠ Done  

**Erwartet:**
- „ÜBERFÄLLIG“ wird in der Liste und in der Detailansicht angezeigt
- Nach Setzen des Status auf „Done“ verschwindet die Overdue-Anzeige

---

## 5. Offline-Tests

### TC-07: Offline arbeiten (CRUD)
**Vorbedingung:** Gerät im Flugmodus (keine Internetverbindung)  

**Schritte:**
1. Aufgabe erstellen
2. Status ändern
3. Aufgabe bearbeiten
4. Aufgabe löschen  

**Erwartet:**
- Alle Aktionen funktionieren ohne Internetverbindung
- App stürzt nicht ab

---

### TC-08: Offline → Online (Synchronisations-Stub)
**Vorbedingung:** Änderungen wurden im Offline-Modus durchgeführt  

**Schritte:**
1. App im Offline-Modus starten
2. Änderungen durchführen
3. Internetverbindung aktivieren
4. App neu starten  

**Erwartet:**
- SyncService wird automatisch gestartet (Stub)
- In der Konsole erscheinen Logs zur Verarbeitung der Sync-Queue
- Sync-Queue-Einträge werden als verarbeitet markiert

---

## 6. Automatisierte Unit Tests

### TaskService (Service Layer)
Getestet werden:
- Delegation an das Repository
- Erstellung von Tasks mit Default-Werten
- Validierung (z.B. leerer Titel)
- Update-Logik inkl. Timestamps
- Löschen von Tasks
- Statusänderungen
- Enqueue von Sync-Events

Externe Abhängigkeiten (Repository, SyncQueueRepository) werden gemockt.

---

### SqliteTaskRepository (Data Layer)
Getestet werden:
- Korrekte SQL-Aufrufe (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
- Parametrierung der SQL-Statements
- Mapping von Datenbankzeilen zu Domain-Objekten
- Unterstützung unterschiedlicher Rückgabeformate (Objekt- und Array-Rows)
- Fallback-Mapping für Feldnamen (`created_at`, `updated_at`)

Der SQLite-Client wird vollständig gemockt, es wird keine echte Datenbank verwendet.

---

## 7. Abgrenzung
UI-Tests wurden bewusst manuell durchgeführt.
End-to-End-Tests mit echtem Backend sind nicht Teil dieses Projekts,
da der Fokus auf Offline-Fähigkeit, sauberer Architektur und Testbarkeit liegt.