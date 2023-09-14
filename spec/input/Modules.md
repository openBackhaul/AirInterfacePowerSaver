### Substructure of the AirInterfacePowerSaver

Die durch den AirInterfacePowerSaver zu erledigenden Aufgaben lassen sich in mehrere Modultypen strukturieren.
Nicht von jedem Modultyp muss von Anfang an eine Implementierung vorliegen.
In vielen Fällen können Module der unterschiedlichen Modultype flexibel ergänzt oder außer Betrieb genommen werden.
Es erscheint in manchen Fällen sogar sinnvoll mehrere Module des selben Modultyps im Rahmen einer kontinuierlichen Optimierung parallel zu betreiben.

Die Schnittstellen zwischen den Modulen werden auf der API des AirInterfacePowerSaver verfügbar gemacht.
So können die jeweiligen Funktionen auch durch andere Applikationen genutzt oder substituiert werden.
Dies dient auch der Vorbereitung auf eine Verschaltung mit proprietären Funktionen, die dezentral auf den Geräten oder in einer 3rd-party Software implementiert sind.

Es ergeben sich folgende Modultypen:

Administration von Automatisierungen
Es werden Schaltvorgänge auf vielen Links in derselben Weise durchgeführt.
Allerdings zerfällt die Gesamtheit aller Links in mehrere Untergruppen, die unterschiedliche Automatisierungen erfahren.
Die Liste aller Links wird gelesen, verändert und geschrieben.
Die Zuweisung einer oder mehrerer Automatisierungen zu einem Link wird dokumentiert.

Visualisierung der Administration von Automatisierungen
Das Bearbeiten der Listen wird durch eine GUI unterstützt.

Linkgruppen bezogene Automatisierung
Die De-/Aktivierung des power saving mode wird für ganze Gruppen von Links gesteuert.
Beispiel: Um 2am wird die Aktivierung des power saving mode auf allen Links der Gruppe ausgelöst.

Link bezogene Automatisierung
Die De-/Aktivierung des power saving mode wird für einzelne Links gesteuert.
Beispiel: Aufgrund gemeldeter Paketverluste wird die Deaktivierung des power saving mode auf einem bestimmten Link ausgelöst.

Linkgruppen bezogene Umsetzung eines Schaltvorgangs
Sobald eine Umschaltung durch die Linkgruppen bezogene Automatisierung ausgelöst wird, muss diese in Link bezogene Schaltvorgänge zerlegt werden.
Wird die Umschaltung auf allen Links der Gruppe zeitgleich ausgelöst, oder nacheinander? Muss ein sliding window organisiert werden?
Werden Links, die im ersten Versuch nicht erfolgreich umgeschaltet werden konnten, erneut angesprochen?
Falls es herstellerspezifische Implementierungen des Link bezogenen Schaltvorgangs geben sollte, wird hier linkweise entschieden, auf welcher Implementierung die Umschaltung ausgelöst wird.

Linkanalyse
Die Linkanalyse bekommt eine Link-ID übergeben und liefert aller für die Link bezogene Umsetzung eines Schaltvorgangs notwendigen Daten zurück.
Die Terminierungspunkte (AirInterfaces) der Links werden ermittelt und dokumentiert (UUID und Local-ID).
Master- und Slave-Links werden identifiziert und dokumentiert.
Es wird festgestellt, ob die Schaltung überhaupt durchgeführt werden darf.

Link bezogene Umsetzung eines Schaltvorgangs
Sobald die Umschaltung eines Links ausgelöst wurde, muss diese in eine Transaktion auf den beteiligten Geräten zerlegt und durchgeführt werden.
Gibt es Vorbedingungen, die auf den beteiligten Geräten zunächst geprüft werden müssen, bevor die Konfiguration beginnen darf?
Welche Attribute sollen geändert werden? Müssen zunächst multi-channel Konfigurationen aufgelöst werden, bevor die power saving Konfiguration durchgeführt werden kann.
In welcher Reihenfolge müssen die Konfigurationen auf den Geräten durchgeführt werden?
Muss die Alarmierung temporär deaktiviert werden?
Wie soll vorgegangen werden, wenn die Konfigurationsschritte nur teilweise (z.B. auf nur einem der beiden Geräte) umgesetzt werden konnten?
Schließlich muss der Status des Links an den Aufrufer zurückgemeldet werden.

Status des power savings
Information darüber, auf welchen Links der power saving mode gegenwärtig aktiviert ist, wird an einer zentralen Stelle verfügbar gemacht.

Logging von Schaltvorgängen
Information darüber, wann und auf welchem Link ein Schaltvorgang ausgelöst wurden und ob dieser erfolgreich abgeschlossen wurde, wird an einer zentralen Stelle verfügbar gemacht.
Das Modul unterstützt das Filtern z.B. nach Link-IDs oder nach erfolglosen Deaktivierungen des power saving mode.

Performance des power savings
Auf Basis der dokumentierten Schaltvorgänge und eines unterstellten Strompreises werden die Einsparungen berechnet.
Daneben wird über die Anzahl der erfolgreichen und erfolglosen Schaltvorgänge informiert.


### Modules im Release v1.0.0

Visualisierung von Listen von Links
Ist nicht vorgesehen.

....
