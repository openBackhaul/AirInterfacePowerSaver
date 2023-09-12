Delete this link at the end of the specification process:  
- [Roadmap to Specification](../../issues/1)

# AirInterfacePowerSaver

### Location
The AirInterfacePowerSaver belongs to the NetworkApplications.

### Description
The AirInterfacePowerSaver is supporting lowering the power consumption of microwave devices by switching off transmitters.  

**LoadFileModule** (future release, see [issue #16](https://github.com/openBackhaul/AirInterfacePowerSaver/issues/16))   
A cyclic operation separates AirLayer connections into master and slave category.  
Exclusively AirLayer connections belonging to the slave category will be switched into the power save mode, but proper operation of the related AirLayer connection in the master catergory is assured before.  
The list of AirLayer connections is stored into a LOADfile.  
Every entry into the list comprises 
- name of the AirLayer connection (Telefonica Link-ID)
- UUID of the AirLayer connection
- mountName, UUID, Local-ID required for identifying both AirInterfaces terminating the AirLayer connection
- category [master, slave]
- if slave: UUID of the related master AirLayer connection

**TimingModule**  
The TimingModule allows separating the 24 hours period of a day into power saving and normal operation segments.  
At the beginning of the power saving segments, the AIPS://v1/start-power-saving-period service gets called.  
At the beginning of the normal operation segments, the AIPS://v1/start-normal-operation-period service gets called.  
The times when to change between the operation modes are configurable and stored into instances of StringProfile.  

**PowerSavingModule**  
After calling /v1/start-power-saving-period  
- /v1/stop-normal-operation-period gets automatically addressed  
- the AirLayer connections get read from the LOADfile  
- the expected rx-levels get read from another LOADfile  
- /v1/activate-power-saving-on-link gets sequentially called for all the loaded connections  
- /v1/activate-power-saving-on-link is returning the status of the treated AirLayer connection  
- the status gets stored into the LOADfile (just overwrites existing status values)

**PowerSavingActivationModule**  
Calling /v1/activate-power-saving-on-link activates the PowerSavingActivationModule.  
It resolves the request for activating the power saving mode on an AirLayer _connection_ into multiple configuration steps on the affected _devices_ and returns the resulting status.  
In its current release, it is implementing the following functions:  
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

**NormalOperationModule**  
After calling /v1/start-normal-operation-period  
- /v1/stop-power-saving-period gets automatically addressed  
- the AirLayer connections belonging to the slave category get read from the LOADfile and filled into the workingList  
- /v1/stop-power-saving-on-link gets sequentially called for all the connections on the workingList  
- /v1/stop-power-saving-on-link is returning the status of the treated AirLayer connection  
- if /v1/stop-power-saving-on-link returns the status "normal-operation", the AirLayer connection is removed from the workingList  
- if /v1/stop-power-saving-on-link returns the status "incomplete", the status read from the LOADfile gets assessed  
  - if the status read from the LOADfile equals "no reading" or "normal-operation" the AirLayer connection is also removed from the workingList  
  - if the status read from the LOADfile equals "power-saving" or "debugging required" the AirLayer connection is kept on the workingList  
- after sequentially calling all the connections on the workingList, the process shall pause for a number of minutes that is configured and stored in an instance of IntegerProfile  
- after pausing, the process resumes with sequentially calling /v1/stop-power-saving-on-link for the rest of AirLayer connections on the workingList  

**RestorationModule**  
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

.  
.  
.  

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

Modules:
- Update LOADfile
- Schedule operation period calls
- Power saving period
- Normal operation period

### Relevance
The AirInterfacePowerSaver fulfils an optimization task on the live network.

### Resources
- [Specification](./spec/)
- [TestSuite](./testing/)
- [Implementation](./server/)

### Comments
This application will be specified during [training for ApplicationOwners](https://gist.github.com/openBackhaul/5aabdbc90257b83b9fe7fc4da059d3cd).
