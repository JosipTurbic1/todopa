# Testdokumentation (Manual Tests)

## Testumgebung
- Plattform: iOS Simulator / Android Emulator (optional)
- App: NativeScript (Core + TypeScript)
- Persistenz: SQLite (lokal)
- Offline-First: Änderungen werden lokal gespeichert; Sync-Queue bereitet spätere Synchronisation vor.

## Testdaten
- Beispielaufgabe: Titel "Einkaufen", Priorität "High", Deadline gesetzt

---

## Testfälle

### TC-01: Aufgabe erstellen
**Vorbedingung:** App gestartet  
**Schritte:**
1. Auf „+“ klicken
2. Titel eingeben
3. Priorität wählen
4. Speichern
**Erwartet:**
- Aufgabe erscheint in der Liste
- App stürzt nicht ab

### TC-02: Aufgabe bearbeiten
**Vorbedingung:** Es existiert eine Aufgabe  
**Schritte:**
1. Aufgabe öffnen
2. „Bearbeiten“ klicken
3. Titel ändern
4. Speichern
**Erwartet:**
- Änderungen sind in Liste und Detail sichtbar

### TC-03: Status ändern
**Vorbedingung:** Aufgabe existiert  
**Schritte:**
1. Aufgabe öffnen
2. Status auf „In Progress“ ändern
3. Status auf „Done“ ändern
**Erwartet:**
- Status wird sofort aktualisiert
- Nach App-Neustart bleibt Status erhalten

### TC-04: Aufgabe löschen
**Vorbedingung:** Aufgabe existiert  
**Schritte:**
1. Aufgabe öffnen
2. „Löschen“ klicken
3. Bestätigen
**Erwartet:**
- Aufgabe verschwindet aus der Liste
- Nach App-Neustart bleibt sie gelöscht

### TC-05: Sortierung (Priorität + Deadline)
**Vorbedingung:** Mehrere Aufgaben mit unterschiedlichen Prioritäten/Deadlines  
**Erwartet:**
- High vor Medium vor Low
- Bei gleicher Priorität: frühere Deadline zuerst
- Aufgaben ohne Deadline am Ende

### TC-06: Overdue Anzeige
**Vorbedingung:** Aufgabe mit Deadline in der Vergangenheit und Status != Done  
**Erwartet:**
- „ÜBERFÄLLIG“ erscheint in Liste und Detail
- Nach Setzen auf Done verschwindet „ÜBERFÄLLIG“

---

## Offline-Tests

### TC-07: Offline arbeiten (CRUD)
**Vorbedingung:** Gerät offline (Flugmodus)  
**Schritte:**
1. Aufgabe erstellen
2. Status ändern
3. Aufgabe bearbeiten
4. Aufgabe löschen
**Erwartet:**
- Alles funktioniert ohne Internet
- App stürzt nicht ab

### TC-08: Offline → Online (Sync Stub)
**Vorbedingung:** Einige Änderungen wurden offline gemacht  
**Schritte:**
1. App starten (offline)
2. Änderungen durchführen
3. Internet einschalten
4. App neu starten
**Erwartet:**
- SyncService wird automatisch gestartet (Stub)
- In der Konsole erscheinen Logs zur Queue-Verarbeitung
- Queue-Events werden als verarbeitet markiert (Stub)
