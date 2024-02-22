## Structure of the AirInterfacePowerSaver

The tasks to be performed by the AirInterfacePowerSaver can be divided into several module types.  
Not every module type has to be implemented from the beginning.  
In many cases modules of the different module types can be added or removed flexibly.  
In some cases it even makes sense to run several modules of the same type in parallel as part of a continuous optimization.  

The interfaces between the modules are provided on the API of the AirInterfacePowerSaver.  
Thus, the respective functions can also be used or replaced by other applications.  
This also serves to prepare for integration with proprietary functions implemented decentrally on the devices or in 3rd party software.  


### Module types
This section describes a structuring of function into modules.  
It categorizes the function as it is planned to be implemented in multiple releases of the AIPS.  

#### Management of automations
Switching operations are performed in the same way on many links.  
However, the total of all links might be divided into several subgroups that experience different kinds of automation.  
In a list of all links, the individual links are assigned none, one or more kinds of automation.  
Visualization of automation management: editing the list of all links is supported by a GUI.  

#### Link group related automation
Enabling and disabling of the power saving mode is controlled for whole groups of links by this type of module.  
The purpose of this type of module is monitoring input parameters for the occurrence of a predefined event and triggering a link group related switching operation.  
Example: At 2 a.m., the activation of the power saving mode is triggered on all links of the group.  

#### Link related automation
This type of module activates or deactivates the power saving mode for individual links.  
One or several input parameters get monitored for the occurrence of a predefined event. Eventually a link related switching operation gets triggered.  
It seems to be likely that one or several link related automation modules will be assigned in parallel to a link group related automation to an individual link in future.  
E.g., a time based link group related automation might be combined with a link related automation that is monitoring packet loss or degradation of the operated modulation.  

#### Link group related switching operation
Once a switchover is triggered by a link group related automation module, the task must be broken down into link related switching operations.  
Is the switchover triggered on all links of the group at the same time or one after the other? Is the sliding window approach required to execute a configurable number of switchovers in parallel?
Get links that could not be successfully switched at the first attempt addressed again? If yes, how often or how long?
Does the group of links that are to be switched break down into subgroups that need to be handled by different link related switching operations (e.g., by vendor)?

#### Link related switching operation
Once a link switchover has been triggered, it must be broken down into configuration steps on the affected devices.  
The individual implementation of the link related switching operation controls which attributes are to be changed, in which order this is to be done, and whether preparatory and clean-up actions (e.g., deactivation/activation of alarm notifications) are required.  
The link related switching operation also manages the entire transaction, which might involve e.g. a roll-back in case the sequence of configuration steps could only be partially implemented (e.g. on only one of the two devices).  
When processing is complete, the status of the link is reported to the requestor, to a central status documentation, and to the switching operation logging.  
An undesired end state is reported to a central alarm management system. 

#### Link Analysis
The link analysis modules support the link related switching operation modules by providing details about the link and its endpoints.  
The request has to contain a Link-ID and it returns
 - the identification of the termination points,
 - all necessary data to evaluate whether the link is qualified for the power saving mode and to configure the changes
 - and the identification of a parallel link and its termination points, if there is one.  

#### Power saving status
Information about which links are currently in power saving mode is centrally documented and made available.  
Information on individual links or lists filtered by status are made available to other applications or for analysis.  

#### Power saving logging
Information about when and on which link a switching operation was triggered and whether it was completed successfully is centrally documented and made available.  
Historical information on individual links or lists filtered by event type (e.g., failed shutdown) are made available for other applications or analysis.  

#### Power saving performance
The documented switching events are evaluated for savings, number events and other aspects.  
Savings are calculated based on an assumed electricity price.  
The number of successful and unsuccessful switching events is compared.  

#### Alarm management of the power saver
Alarms reported by the individual modules are documented and can be read at a central location.  
Subscribing for alarm notifications is supported, too.  

### Modules and their Release Planning  

Please find descriptions of modules of the afore mentioned categories and their scheduling into releases of the AirInterfacePowerSaver:  
- [AIPS v0.0.5](./Overview_0.0.5.md)  
- [AIPS v0.0.9](./Overview_0.0.9.md)  
- [AIPS v0.0.10](./Overview_0.0.10.md)  
