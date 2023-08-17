Delete this link at the end of the specification process:  
- [Roadmap to Specification](../../issues/1)

# AirInterfacePowerSaver

### Location
The AirInterfacePowerSaver belongs to the NetworkApplications.

### Description
The AirInterfacePowerSaver is supporting saving electricity by either reducing transmit power or turning off entire air interfaces (if several radio links are operating in parallel). The switching might be driven by time of day or measured data like number of transported frames or dropped packages.

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

