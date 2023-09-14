### Substructure of the AirInterfacePowerSaver

Die durch den AirInterfacePowerSaver zu erledigenden Aufgaben lassen sich in mehrere Modultypen strukturieren.
Nicht von jedem Modultyp muss von Anfang an eine Implementierung vorliegen.
In vielen Fällen können Module der unterschiedlichen Modultype flexibel ergänzt oder außer Betrieb genommen werden.
Es erscheint in manchen Fällen sogar sinnvoll mehrere Module des selben Modultyps im Rahmen einer kontinuierlichen Optimierung parallel zu betreiben.

Die Schnittstellen zwischen den Modulen werden auf der API des AirInterfacePowerSaver verfügbar gemacht.
So können die jeweiligen Funktionen auch durch andere Applikationen genutzt oder substituiert werden.
Dies dient auch der Vorbereitung auf eine Verschaltung mit proprietären Funktionen, die dezentral auf den Geräten oder in einer 3rd-party Software implementiert sind.

Es ergeben sich folgende Modultypen:

Administration der Automatisierungen
Es werden Schaltvorgänge auf vielen Links in derselben Weise durchgeführt.
Allerdings zerfällt die Gesamtheit aller Links in mehrere Untergruppen, die unterschiedliche Automatisierungen erfahren.
In einer Liste aller Links werden den einzelnen Links keine, eine oder mehrere Automatisierungen zugewiesen.
Es können die Informationen eines Links abgerufen werden.
Die Einträge können nach einzelnen Automatisierungen gefiltert werden.
Links können einzeln oder gruppenweise einer Automatisierungen zugewiesen werden.
Die Liste wird in einem File gespeichert.

Visualisierung der Administration von Automatisierungen
Das Bearbeiten der Liste aller Links wird durch eine GUI unterstützt.

Linkgruppen bezogene Automatisierung
Die De-/Aktivierung des power saving mode wird für ganze Gruppen von Links gesteuert.
Die Automatisierung besteht lediglich in der Überwachung von Inputparametern auf das Eintreten eines vorbestimmten Ereignisses und dem anschließenden Auslösen der Linkgruppen bezogene Umsetzung eines Schaltvorgangs.
Beispiel: Um 2am wird die Aktivierung des power saving mode auf allen Links der Gruppe ausgelöst.

Link bezogene Automatisierung
Die De-/Aktivierung des power saving mode wird für einzelne Links gesteuert.
Die Automatisierung besteht lediglich in der Überwachung von Inputparametern auf das Eintreten eines vorbestimmten Ereignisses und dem anschließenden Auslösen der Link bezogene Umsetzung eines Schaltvorgangs.
Beispiel: Es werden Paketverluste vor einem Masterlink festgestellt, folglich wird die Deaktivierung des power saving mode auf dem zugehörigen Slavelink ausgelöst.

Linkgruppen bezogene Umsetzung eines Schaltvorgangs
Sobald eine Umschaltung durch die Linkgruppen bezogene Automatisierung ausgelöst wird, muss diese in Link bezogene Schaltvorgänge zerlegt werden.
Wird die Umschaltung auf allen Links der Gruppe zeitgleich ausgelöst, oder nacheinander? Muss ein sliding window organisiert werden?
Werden Links, die im ersten Versuch nicht erfolgreich umgeschaltet werden konnten, erneut angesprochen?
Zerfällt die Gruppe der umzuschaltenden Links in Untergruppen, die durch verschiedene Link bezogenen Umsetzungen des Schaltvorgangs bearbeitet werden müssen (z.B. herstellerweise)?

Linkanalyse
Die Linkanalyse bekommt eine Link-ID übergeben und liefert aller für die Link bezogene Umsetzung eines Schaltvorgangs notwendigen Daten zurück.
Die Terminierungspunkte (AirInterfaces) der Links werden ermittelt und dokumentiert (UUID und Local-ID).
Master- und Slave-Links werden identifiziert und dokumentiert.
Kriterien, die für die Entscheidung, ob die Umschaltung überhaupt durchgeführt werden darf, erforderlich sind, werden ermittelt und dokumentiert.

Link bezogene Umsetzung eines Schaltvorgangs
Sobald die Umschaltung eines Links ausgelöst wurde, muss diese in Konfigurationsaktivitäten auf den beteiligten Geräten zerlegt und durchgeführt werden.
Ein Aufruf der Linkanalyse liefert die Daten für die Entscheidung darüber, ob die Umschaltung überhaupt erfolgen darf.
Die spezifische Implementierung der Link bezogenen Umsetzung des Schaltvorgangs regelt welche Attribute geändert werden sollen, in welcher Reihenfolge das geschehen soll und, ob vor- und nachbereitende Maßnahmen (z.B. de-/aktivieren von Alarm notifications) erforderlich sind.
Die Link bezogene Umsetzung eines Schaltvorgangs regelt auch das Vorgehen (z.B. roll-back), wenn die Konfigurationsschritte nur teilweise (z.B. auf nur einem der beiden Geräte) umgesetzt werden konnte.
Nach Abschluss der Bearbeitung wird der Status des Links an den Aufrufer, eine zentrale Statusdokumentation und an das Logging von Schaltvorgängen gemeldet.
Ein ungewünschter Endzustand wird an ein zentrales Alarmmanagement gemeldet. 

Statusdokumentation des power savings
Information darüber, auf welchen Links der power saving mode gegenwärtig aktiviert ist, wird zentral dokumentiert und verfügbar gemacht.
Information über einzelne Links oder nach Status gefilterte Listen werden für andere Applikationen oder zur Analyse bereitgestellt.

Logging des power savings
Information darüber, wann und auf welchem Link ein Schaltvorgang ausgelöst wurden, und ob dieser erfolgreich abgeschlossen wurde, wird zentral dokumentiert und verfügbar gemacht.
Historischen Information über einzelne Links oder nach z.B. Ereignisstypen (z.B. erfolglose Deaktivierung) gefilterte Listen werden für andere Applikationen oder zur Analyse bereitgestellt.

Performance des power savings
Die dokumentierten Schaltvorgänge werden nach verschiedenen Gesichtspunkten ausgewertet.
Auf Basis eines unterstellten Strompreises werden die Einsparungen berechnet.
Die Anzahl der erfolgreichen und erfolglosen Schaltvorgänge werden gegenübergestellt.

Alarmmanagement des power savings
Die aus den einzelnen Modulen gemeldeten Alarme werden dokumentiert und können an zentraler Stelle ausgelesen werden.


### Modules im Release v1.0.0

Administration der Automatisierungen
Wird in AIPS 1.0.0 nicht enthalten sein.
Die Liste von Links und die Zuweisung einer Automatisierung wird manuell erstellt.

Visualisierung der Administration von Automatisierungen
Wird in AIPS 1.0.0 nicht enthalten sein.
Die Liste von Links und die Zuweisung einer Automatisierung wird offline erstellt.

Linkgruppen bezogene Automatisierung
AIPS 1.0.0 wird eine Linkgruppen bezogene Automatisierung enthalten.
Diese soll power saving zu vorbestimmten Zeitpunkten an- und ausschalten.
Die Uhrzeit wäre der zu überwachende Inputparametern.
Abhängig vom erreichten Wert wird entweder ein Linkgruppen bezogener Ein- oder Ausschaltvorgang ausgelöst.

Link bezogene Automatisierung
Wird in AIPS 1.0.0 nicht enthalten sein.
(Eine Deaktivierung des power save mode bei Paketverlust läge nahe.)

Linkgruppen bezogene Umsetzung eines Schaltvorgangs
AIPS 1.0.0 wird zwei Linkgruppen bezogene Schaltvorgänge enthalten.
Einschalten des power save mode
_Needs to be formulated after lunch_
Ausschalten des power save mode
_Needs to be formulated after lunch_

Linkanalyse
AIPS 1.0.0 wird eine Linkanalyse enthalten.
_Needs to be formulated after lunch_

Link bezogene Umsetzung eines Schaltvorgangs
AIPS 1.0.0 wird eine Link bezogene Umsetzung des Schaltvorgangs enthalten.
_Needs to be formulated after lunch_

Statusdokumentation des power savings
AIPS 1.0.0 wird eine zentrale Dokumentation darüber enthalten, auf welchen Links der power save mode angeschaltet ist.

Logging des power savings
Wird in AIPS 1.0.0 nicht enthalten sein.

Performance des power savings
Wird in AIPS 1.0.0 nicht enthalten sein.

Alarmmanagement des power savings
Wird in AIPS 1.0.0 nicht enthalten sein.
