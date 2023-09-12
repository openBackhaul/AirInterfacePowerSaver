Delete this link at the end of the specification process:  
- [Roadmap to Specification](../../issues/1)

# AirInterfacePowerSaver

### Location
The AirInterfacePowerSaver belongs to the NetworkApplications.

### Description
The AirInterfacePowerSaver is supporting lowering the power consumption of microwave devices by switching off transmitters.  
(The idea of adding a fallback function was postponed due to the vendor-specific characteristics of the maintenance timer implementations.)  

A cyclic operation separates AirLayer connections into master and slave category (future release, see [issue #16](https://github.com/openBackhaul/AirInterfacePowerSaver/issues/16)).  
Exclusively AirLayer connections belonging to the slave category are subject to the switching into the power save mode.  
The list of AirLayer connections belonging to the slave category is stored into a LOADfile.  

In principle the application is separating the 24 hours period of a day into two segments.  
During the power saving period it is addressing all AirLayer connections belonging to the slave category once for configuring the power save mode.  
Links/Devices that could not be reached or configured get marked in the LOADfile (overwrites existing markings).  
During the normal operation period it is addressing all AirLayer connections belonging to the slave category until it could configure the original mode again on all devices.  
The periodicity of the attempts is configurable and stored into an instance of IntegerProfile.
Only a limited number of attempts are made on Links/Devices that are marked as not being reachable or configurable in the LOADfile.

Two operations start-power-saving and start-original-period

Switching to the energy saving mode is done with a simple process (no retry etc.) at a configurable time (e.g. 2am).  
Alarm notifications get suppressed by temporarily disabling notifications for the respective alarm categories.  
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

During a call on 17th of August we discussed a first version with the following characteristics:
- Selection : manual pre-selection of low traffic links
- Scheduling : fixed down time e.g. between 2-6am
- Topology : manual pre-defined (master, slaver), but no remote/local distinguishing
- Check : check rx-level at master against tabular value
- Switching : slave odu power off
- x-pol-config : not dismantling it
- Alarms : suppressing alarms during slaver off

