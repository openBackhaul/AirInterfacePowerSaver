/**
 * The file consists of the attributes to refer power saving status of link.
 *  
 **/

/******************************************
 ******** link **************
 *****************************************/
const LINK = {
    LINK_ID: "link-id",

};

/******************************************
 ******** power saving status **************
 *****************************************/

 const DEVIATION_FROM_ORIGINAL_STATE = {
    ADD: "add-deviation-from-original-state",
    REMOVE: "remove-deviation-from-original-state",
    LIST: "deviation-from-original-state-list"
 }

 const MODULE_TO_RESTORE_ORIGINAL_STATE = {
    ADD: "add-module-to-restore-original-state",
    REMOVE: "remove-module-to-restore-original-state",
    LIST: "module-to-restore-original-state-list"
 }

 module.exports ={
    LINK, 
    DEVIATION_FROM_ORIGINAL_STATE,
    MODULE_TO_RESTORE_ORIGINAL_STATE
 }