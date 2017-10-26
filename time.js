/*************

MAIN LOGIC FOR CALCULATING NEXT TRAIN ARRIVAL AND MINUTES AWAY 
GIVEN FTT (FIRST TRAIN TIME) AND FREQUENCY

**************/

// Utility function to add "0" in front of the hour or minute if it is less than 10 for display
// E.g. instead of displaying 1:5 it displays 01:05
function addZero(i) {
	if (i < 10) {
	    i = "0" + i;
	}
	return i;
}

// Utility function to get current time and return in HH:MM format
function currentTime() {
	var d = new Date();
    var x = document.getElementById("demo");
    var h = addZero(d.getHours());
    var m = addZero(d.getMinutes());
    var current = h+":"+m;
    return current;	
}

// Utility function to convert minutes into HH:MM format
function minutesToString(minutes) {
	var hour = addZero(parseInt(minutes/60));
	var min = addZero(minutes%60);

	return(hour + ":" + min);
}

// Utility function to convert HH:MM to total minutes
function convertTimeToMinutes(h, m) {
	return (h*60+m);
}

// Utility function to check if a given time string is in valid HH:MM format
function validTimeString(timeStr) {
	var timeArray = timeStr.split(":");
	if (isNaN(parseInt(timeArray[0])) || isNaN(parseInt(timeArray[1]))) {
		return false;
	}
	return true;
}

// Given first train time (start) and frequency(freq) calculate the NExt Train Arrival
// And Minutes Away.
// Returns an array with these two values
// Called from train.js when populating Train Table Rows
function nextArrivalTime(start, freq) {

    var current = currentTime();
    var currArray = current.split(":");
    var currentMinutes = convertTimeToMinutes(parseInt(currArray[0]), parseInt(currArray[1]));
    
    var startArray = start.split(":");
    var startMinutes = convertTimeToMinutes(parseInt(startArray[0]), parseInt(startArray[1]));

    if (currentMinutes <= startMinutes) {
    	// case where the train hasn't even started

 		var next = minutesToString(startMinutes);
 		var away = startMinutes - currentMinutes;
    } else {
    	var diff = 	currentMinutes-startMinutes;
    	var modulo = diff%freq;

    	var next = minutesToString(currentMinutes + (freq - modulo));
    	var away = freq - modulo;
    }
    var returnArray = [];
 
    returnArray[0] = next;
    returnArray[1] = away;

    return returnArray;
}	



