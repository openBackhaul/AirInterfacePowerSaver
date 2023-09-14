### Structure of the AirInterfacePowerSaver

Die durch den AirInterfacePowerSaver zu erledigenden Aufgaben lassen sich in mehrere Modultypen strukturieren.
Nicht von jedem Modultyp muss von Anfang an eine Implementierung vorliegen.
In vielen Fällen können Module der unterschiedlichen Modultype flexibel ergänzt oder außer Betrieb genommen werden.
Es erscheint in manchen Fällen sogar sinnvoll mehrere Module des selben Modultyps im Rahmen einer kontinuierlichen Optimierung parallel zu betreiben.

Die Schnittstellen zwischen den Modulen werden auf der API des AirInterfacePowerSaver verfügbar gemacht.
So können die jeweiligen Funktionen auch durch andere Applikationen genutzt oder substituiert werden.
Dies dient auch der Vorbereitung auf eine Verschaltung mit proprietären Funktionen, die dezentral auf den Geräten oder in einer 3rd-party Software implementiert sind.

### Modultypen:

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


### Übersicht der Module im Release v1.0.0

Administration der Automatisierungen
AIPS 1.0.0 wird kein Modul dieses Typs enthalten.
Die Liste von Links und die Zuweisung einer Automatisierung wird manuell erstellt.

Visualisierung der Administration von Automatisierungen
AIPS 1.0.0 wird kein Modul dieses Typs enthalten.
Die Liste von Links und die Zuweisung einer Automatisierung wird offline erstellt.

Linkgruppen bezogene Automatisierung
AIPS 1.0.0 wird ein Modul zur Linkgruppen bezogene Automatisierung enthalten.
Das TimeBasedPowerSaving Modul soll power saving auf nicht weiter differenzierten Gruppen von Links zu vorbestimmten Zeitpunkten an- und ausschalten.
Die Uhrzeit wäre der zu überwachende Inputparametern.
Abhängig vom erreichten Wert wird entweder ein Linkgruppen bezogener Ein- oder Ausschaltvorgang ausgelöst.

Link bezogene Automatisierung
AIPS 1.0.0 wird kein Modul dieses Typs enthalten.
(Eine Deaktivierung des power save mode bei Paketverlust läge nahe.)

Linkgruppen bezogene Umsetzung eines Schaltvorgangs
AIPS 1.0.0 wird zwei Module für Linkgruppen bezogene Schaltvorgänge enthalten.
Das SimpleActivation Modul implementiert einen einfachen Algorithmus zur Aktivierung des power saving mode auf einer sehr großen Gruppe nicht weiter ausdifferenzierten Links.
Das PersistentDeactivation Modul implementiert einen Algorithmus, der sich ausdauernd darum bemüht alle Links wieder in den original mode zu bekommen.

Linkanalyse
AIPS 1.0.0 wird ein Modul zur Linkanalyse enthalten.
Das BasicLinkAnalysis Modul liefert alle notwendigen Informationen für einen Schaltvorgang auf einem nicht näher ausdifferenzierten Link.

Link bezogene Umsetzung eines Schaltvorgangs
AIPS 1.0.0 wird zwei Module zur Link bezogene Umsetzung eines Schaltvorgangs enthalten.
Das SlaveTransmittersOff Modul aktiviert den power save mode auf einem Link, nachdem es sichergestellt hat, dass ein paralleler Link operativ ist.
Das AllTransmittersOn Modul deaktiviert den power save mode ohne weitere Prüfungen auf einem Link.

Statusdokumentation des power savings
AIPS 1.0.0 wird das ActivationStatus Modul zur zentralen Dokumentation des power saving status enthalten.

Logging des power savings
AIPS 1.0.0 wird kein Modul dieses Typs enthalten.

Performance des power savings
AIPS 1.0.0 wird kein Modul dieses Typs enthalten.

Alarmmanagement des power savings
AIPS 1.0.0 wird kein Modul dieses Typs enthalten.


### Beschreibung der Module im Release v1.0.0

Linkgruppen bezogene Automatisierung - 
The TimeBasedPowerSaving module allows separating the 24 hours period of a day into power saving and normal operation segments. 
At the beginning of the power saving segments, the SimpleActivation Modul gets activated.
At the beginning of the normal operation segments, the PersistentDeactivation Modul gets activated.
The times when to change between the operation modes are configurable and stored into instances of StringProfile.  

Linkgruppen bezogene Umsetzung eines Schaltvorgangs - SimpleActivation
While activating the SimpleActivation module, the TimeBasedPowerSaving module passes a list of Link-IDs.
The SimpleActivation module is sequentially activating the SlaveTransmittersOff Module for each and every Link-ID on that list.
There is no re-try in case of failure.

Linkgruppen bezogene Umsetzung eines Schaltvorgangs - PersistentDeactivation
While activating the PersistentDeactivation module, the TimeBasedPowerSaving module passes a list of Link-IDs.
The PersistentDeactivation module is sequentially activating the AllTransmittersOn Module for each and every Link-ID on that list.
In case the AllTransmittersOn Module indicates the link to be in original operation mode, the PersistentDeactivation is removing the Link-ID from the list.
In case the AllTransmittersOn Module indicates a failure, the PersistentDeactivation is leaving the Link-ID on the list.
After reaching the end of the list of links, the PersistentDeactivation module is waiting for a number of minutes that is defined in an instance of IntegerProfile. 
After pausing, the process resumes with sequentially making another attempt for the rest of links on the list.  

Linkanalyse - BasicLinkAnalysis
While activating the BasicLinkAnalysis module, the SlaveTransmittersOff or the AllTransmittersOn has to pass a Link-ID.
The BasicLinkAnalysis module provides all the necessary data for assessing, whether the link is qualified for being put into power saving mode, and for configuring the changes.
It translates the Link-ID into the UUID of an AirLayer connection.
It determines mount names, UUID and Local-IDs of the AirInterfaces that are terminating the AirLayer connection.
It analysis, whether there is a parallel AirLayer connection and determines the mount names, UUID and Local-IDs of its AirInterfaces.
It reads, the transmitterIsOn, the transmissionModeMax and the transmissionModeCur for the  parallel AirLayer connection.
And returns all this data in the request body.
If it could not read the data from the devices, an error gets indicated.

_[Transfer into diagram:
- reading the AirInterface Configuration classes at both ends of the slave AirLayer connection from MWDI://core-model-1-4:network-control-domain=live/control-construct={mount-name}/logical-termination-point={uuid}/layer-protocol={local-id}/air-interface-2-0:air-interface-pac/air-interface-configuration  
- if the AirInterface Configuration classes couldn't be read from both ends of the slave AirLayer connection, processing terminates and returns status "no reading"  
- reading the rx-level from both ends of the master AirLayer connection from MWDI://core-model-1-4:network-control-domain=live/control-construct={mount-name}/logical-termination-point={uuid}/layer-protocol={local-id}/air-interface-2-0:air-interface-pac/air-interface-status?fields=rx-level  
- if rx-level would differ from the expected value at one of the AirInterfaces of the master AirLayer connection, /v1/activate-power-saving-on-link returns the status "master-not-ready"  
- setting transmitter-is-on = false in the retrieved Configuration classes of the slave AirLayer connection  
- writing both the altered Configuration classes to MWDG://core-model-1-4:network-control-domain=live/control-construct={mount-name}/logical-termination-point={uuid}/layer-protocol={local-id}/air-interface-2-0:air-interface-pac/air-interface-configuration  
- if both the writing requests return an http response code 204, /v1/activate-power-saving-on-link returns the status "power-saving"  
- if at least one of the writing requests returns an http response code different from 204,  
  - transmitter-is-on is set back on true in both Configuration classes  
  - both the original Configuration classes are written into MWDG://core-model-1-4:network-control-domain=live/control-construct={mount-name}/logical-termination-point={uuid}/layer-protocol={local-id}/air-interface-2-0:air-interface-pac/air-interface-configuration
  - reading again the AirInterface Configuration classes at both ends of the AirLayer connection from MWDI://core-model-1-4:network-control-domain=live/control-construct={mount-name}/logical-termination-point={uuid}/layer-protocol={local-id}/air-interface-2-0:air-interface-pac/air-interface-configuration  
  - if the AirInterface Configuration classes couldn't be read from both ends of the AirLayer connection, processing terminates and returns status "no reading"  
  - if transmitter-is-on == true in both Configuration classes, /v1/activate-power-saving-on-link returns the status "normal-operation"  
  - if transmitter-is-on would have different values in the Configuration classes, /v1/activate-power-saving-on-link returns the status "debugging required"  
]_
_[weiteren Bedarf an diesem Issue prüfen: [issue #16](https://github.com/openBackhaul/AirInterfacePowerSaver/issues/16)]_


Link bezogene Umsetzung eines Schaltvorgangs - SlaveTransmittersOff
_[an idempotenz denken, wenn slave transmitter bereits off, sofort Erfolg melden]_
It resolves the request for activating the power saving mode on an AirLayer _connection_ into multiple configuration steps on the affected _devices_ and sends the resulting status.  
Das SlaveTransmittersOff Modul aktiviert den power save mode auf einem Link, in dem es den Sender ausschaltet, nachdem es sichergestellt hat, dass auf einem parallelen Link der erwartete receive level erreicht ist.
- the status gets stored into the LOADfile (just overwrites existing status values)
In its current release, it is implementing the following functions:  


Link bezogene Umsetzung eines Schaltvorgangs - AllTransmittersOn
_[an idempotenz denken, wenn slave transmitter bereits on, sofort Erfolg melden]_
Calling /v1/stop-power-saving-on-link activates the RestorationModule.  
It resolves the request for restoring the original operation on an AirLayer _connection_ into multiple configuration steps on the affected _devices_ and returns the resulting status.  
In its current release, it is implementing the following functions:  
- reading the AirInterface Configuration classes at both ends of the AirLayer connection from MWDI://core-model-1-4:network-control-domain=live/control-construct={mount-name}/logical-termination-point={uuid}/layer-protocol={local-id}/air-interface-2-0:air-interface-pac/air-interface-configuration
- if the AirInterface Configuration classes couldn't be read from both ends of the AirLayer connection, processing shall terminate and return status "incomplete"
- setting transmitter-is-on = true in the retrieved Configuration classes  
- writing both the altered Configuration classes to MWDG://core-model-1-4:network-control-domain=live/control-construct={mount-name}/logical-termination-point={uuid}/layer-protocol={local-id}/air-interface-2-0:air-interface-pac/air-interface-configuration
- if both the writing requests return an http response code 204, /v1/stop-power-saving-on-link returns the status "normal-operation"  
- if at least one of the writing requests returns an http response code different from 204,
  - _[There is a risk that the already successfully switching on transmitter is increasing the interference level to such an extend that the remote site can no longer be reached by the management connection.]_
  - transmitter-is-on is set back on false in both Configuration classes  
  - both the original Configuration classes are written into MWDG://core-model-1-4:network-control-domain=live/control-construct={mount-name}/logical-termination-point={uuid}/layer-protocol={local-id}/air-interface-2-0:air-interface-pac/air-interface-configuration
  - and /v1/stop-power-saving-on-link returns the status "incomplete"  

Statusdokumentation des power savings - ActivationStatus


Alarm notifications get suppressed by temporarily disabling notifications for the respective alarm categories.  
- Check : check rx-level at master against tabular value
- Alarms : suppressing alarms during slaver off


The transmitter gets switched off, but the physical link aggregation and XPIC configurations remain untouched _[unless deletion would be required for suppressing alarms]_.  
The switching does not take place, if  
- the Master ODU does not transmit at its highest modulation.  
- _[utilization/dropped frames]_?  
Aspects of topology (e.g. remote site first) are not considered.  

Starting the normal operation period (switching all the AirLayer connections of slave category back to the original mode) is available as an external service /v1/start-normal-operation-period.  
This external service is regularly called at a configurable time (e.g. 6am).  
It gets also called as a part of the cyclic operation for updating the LOADfile containing the AirLayer connections of slave category.  
It might also be called by other applications that require the microwave network in its original state.  
It is attempting to configure the original state until it is successful on all links AirLayer connections of slave category.  
