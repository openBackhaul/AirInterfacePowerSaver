### Considerations during preparing the specification

1) Centralized or decentralized execution of the PowerSaving algorithm  
  Original plan was centralizing an algorithm and controlling all devices via harmonized management interface.  
  Lately, SIAE presented an own PowerSaving algorithm implemented directly on their devices.  
    - Thorsten:  
      Are all vendors implementing a decentralized approach (or are at least planning it)?  
      Decentralized algorithms could be more powerful, but can we combine them to a solution for 100% of devices?  
      I recommend clarifying, whether Ericsson and Huawei are providing such decentralized algorithms, too.  
      If not, I would recommend sticking with a centralized approach (at least in the first release of the AIPS application).  
 
2) Building on top of proprietary implementations or focus on an own implementation?  
  Original plan was executing the same algorithm on all devices.  
  Lately, Ericsson presented the idea of a PowerSaving algorithm centralized aside their mediator.  
    - Thorsten:  
      Does a proprietary centralized implementation provide any benefit over an own implementation?   
      Would the Ericsson solution work with Huawei and SIAE, too?  
      How would it integrate with the MW SDN ApplicationLayer in regards of management aspects (ApplicationPattern)?  
      How would it integrate with the way of handling the conflict between planning and automation?  
      
3) Which PowerSaving algorithm to choose?  
  Algorithm could base on time, utilization, packet loss, self-learning ...  
    - Thorsten:  
      I would recommend to chose a save and simple algorithm for the first release of the AIPS.  
      The algorithm can be optimized without causing impact to the outside world in future releases.  

4) Conflict between planning and automation?  
  A centralized implementation is most likely changing the configuration (=administrative intend) on the device. What are the consequences for algorithms that are for comparing configuration with planning data base or BNETZA frequency assignments etc.?  
  A decentralized implementation might change just the operational state, but leave the configuration (=as represented at the management interface) untouched. What are the consequences for algorithms that are handling errors or are rebalancing traffic etc.?  
    - Thorsten:  
      The AIPS would be the first application that is autonomously altering a widely monitored attribute in the network.  
      I am not sure, whether the o2 organization is aware of the consequences and ready for that.  
      I would recommend pro-actively leading the discussion about what a change caused by automation mean.  
      Does it replace the planning as the latest expression of the administrative intend, or is it a change of the operational state?  

5) Mitigating risks coming from unstable underlying DCN  
  If capacity of the microwave link got reduced, there is a risk that underlying DCN is unavailable at the time the capacity should be increased again.  
    - Thorsten:  
      I would recommend specifying a simple solution that is sending the request again and again until all links have been put into original state again.  

6) Mitigating risks coming from broken hardware    
  If both radios of one polarization get switched off and the remaining air interface fails (ODU broken), it will not be possible to reach the remote side.  
  It will not be possible to activate the "sleeping" polarization again from remote.  
  This is an additional risk that is inherent to the centralizing approach.  
    - Thorsten:  
      It will happen.  
      Maybe, there is a chance to estimate costs upfront and weight them against the benefits.  
  
