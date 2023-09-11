Delete this link at the end of the specification process:  
- [Roadmap to Specification](../../issues/1)

# AirInterfacePowerSaver

### Location
The AirInterfacePowerSaver belongs to the NetworkApplications.

### Description
The AirInterfacePowerSaver is supporting lowering the power consumption of microwave devices by switching off transmitters.  
(The idea of adding a fallback function was postponed due to the vendor-specific characteristics of the maintenance timer implementations.)  

The ODUs of the affected devices are categorized into master and slave.  
Exclusively ODU of the slave category are subject to the switching (ODUs belonging to the master category don't get touched).  
_[How shall the categorization be managed?]_

Switching to the energy saving mode is done with a simple process (no retry etc.) at a configurable time (e.g. 2am).  
Alarm notifications get suppressed by temporarily disabling notifications for the respective alarm categories.  
The transmitter gets switched off, but the physical link aggregation and XPIC configurations remain untouched _[unless deletion would be required for suppressing alarms]_.  
The switching does not take place, if  
- the Master ODU does not transmit at its highest modulation.  
- _[utilization/dropped frames]_?  
Aspects of topology (e.g. remote site first) are not considered.  

Switching back to the original mode is also done at a configurable time (e.g. 6am), but it is attempted until successful.  

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

