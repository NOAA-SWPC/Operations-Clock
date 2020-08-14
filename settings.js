/* Operations Clock Settings */
// This file can used to customize utc-lcl.html and is required for countdown.html.

/*** utc-lcl.html clock settings ***/
// The stdOffset variable is only used to customize the local timezone image in the lower left of the utc-lcl.html clock.
// Comment this line in and set it to the offset in standard time (EST: 5, CST: 6, MST: 7, PST: 8)
// When stdOffset is set, the images for the local timezones must be set as well.  
// If stdOffset is not set, these images are not used, and "LOCAL" will be displayed for timezone. */
// central
/*
var stdOffset = 6; 
var timezoneImageLST = "digital-clock2/ccst.gif";
var timezoneImageLDT = "digital-clock2/ccdt.gif";
*/
// eastern
/*
var stdOffset = 5; 
var timezoneImageLST = "digital-clock2/cest.gif";
var timezoneImageLDT = "digital-clock2/cedt.gif";
*/
/////////////////////////////////////

/*** countdown.html clock settings ***/
// This is the countdown date for the countdown.html clock
var countdownDate = Date.UTC(2021,1,1,0,0,0);
/////////////////////////////////////
