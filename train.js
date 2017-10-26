/*************

MAIN LOGIC FOR POPULATING FIRE BASE AND THE WEBPAGE WITH LATEST TRAIN INFORMATION

**************/


// Initialize Firebase
var config = {
  apiKey: "AIzaSyC7QVIJx72Uv8Fo-2U_Ece4dzYNw9X1lnI",
  authDomain: "train-activity-4d0c2.firebaseapp.com",
  databaseURL: "https://train-activity-4d0c2.firebaseio.com",
  projectId: "train-activity-4d0c2",
  storageBucket: "train-activity-4d0c2.appspot.com",
  messagingSenderId: "422417814962"
};
firebase.initializeApp(config);

//Get ref to the database
var database = firebase.database();

// Variables to udpate Train Table by the minute
var tableUpdate = 60000; // 1 minute
var tableUpdateTimer;
var trainFttArray = [];

// Update the table Next Arrival and Minutes away by the minute 
function tableUpdateFunction() {

  var numRows = $("table").children()
      .eq(1) // tbody
      .children("tr").length;  //  # of rows
      
  // For each Row    
  for (var i=0; i< numRows; i++) {
    // Get the array of Tds for each row
    var trainRowTds = $("table").children().eq(1).children("tr").eq(i).children("td");
    var name = trainRowTds.eq(0).text();

    // Get the corresponding first Train Time from the saved array
    // There is a better way to do it to improve performance but this works for now
    for (var i=0; i<trainFttArray.length; i++) {
      if (name == trainFttArray[i][0]) {
        var freq = trainRowTds.eq(2).text();
        var nextTrainInfo = nextArrivalTime(trainFttArray[i][1], freq);
        // Use moment JS to display the Next Arrival time in the AM/PM format
        var arrivalTime = moment(moment(nextTrainInfo[0], 'HH:mm')).format("hh:mm A")
        trainRowTds.eq(3).text(arrivalTime);
        trainRowTds.eq(4).text(nextTrainInfo[1]);
        break;
      }
    }
  }

  // Clear and Restart the timer
  clearTimeout(tableUpdateTimer);
  tableUpdateTimer = setTimeout(tableUpdateFunction, tableUpdate); // Restart timer
}

// This function retrieves database snapshot from the firebase
// Add populate Table on the webpage with the database entries
function populateTable() {

  // Let us first clear all table entries since we are getting the latest from the firebase
  $("#table-body").empty();

  var trainRef = database.ref();

  // Get one big snapshot first and then loop thru the children
  // Each child represents one train information
  trainRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childData = childSnapshot.val();
      var trainInfo = [];
      trainInfo[0] = childData.name;
      trainInfo[1] = childData.ftt;
      trainFttArray.push(trainInfo);

      // Create Table Rows now
      addRowElement(childData.name, childData.destination, childData.ftt, childData.frequency);
    });
  });

  tableUpdateTimer = setTimeout(tableUpdateFunction, tableUpdate);
}

// This function populates the table rows on the web page
// This dynamically calculates the Next Train and Minutes Away from the ftt and frequency values
function addRowElement(name, destination, ftt, frequency) {
  var nextTrainInfo = [];

  // Calculate the Next Train and Minutes Away dynamically
  nextTrainInfo = nextArrivalTime(ftt, frequency);

  // Use moment JS to display the Next Arrival time in the AM/PM format
  var arrivalTime = moment(moment(nextTrainInfo[0], 'HH:mm')).format("hh:mm A");
  var row = $("<tr>");
  row.attr('id', "table-row");
  var markup = "<td>" + name + "</td>" +
                "<td>" + destination + "</td>" +
                "<td>" + frequency + "</td>" +
                "<td>" + arrivalTime + "</td>" +
                "<td>" + nextTrainInfo[1] + "</td>";
  row.html(markup);          
  $("#table-body").append(row);
}

// Click function for Submit Button
function submitTrainInformation() {

  event.preventDefault();

  var trainName = $("#train-name").val().trim();
  var trainDest = $("#destination").val().trim();
  var firstTrainTime = $("#first-train-time").val().trim();
  var trainFreq = $("#frequency").val().trim();

  // Error conditions
  if (trainName == "" || trainDest == "" || firstTrainTime == "" || trainFreq == "") {
    alert("Please enter all fields to add a train!")
    return;
  }

  if (isNaN(parseInt(trainFreq))) {
    alert("Please enter a number for train frequency!");
    return;
  }

  if (!validTimeString(firstTrainTime)) {
    alert("Please enter a valid time in military HH:MM format!");
    return;
  }

  // Store the data on firebase first
  database.ref().push({
    name: trainName,
    destination: trainDest, 
    ftt: firstTrainTime, 
    frequency: trainFreq,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });

  // Save First Train Time in this local array
  // We use this to refresh the table cells every minute
  var trainInfo = [];
  trainInfo[0] = trainName;
  trainInfo[1] = firstTrainTime;
  trainFttArray.push(trainInfo);

  // Create Table Rows
  addRowElement(trainName, trainDest, firstTrainTime, trainFreq);

  // Clear the form
  $("#train-name").val("");
  $("#destination").val("");
  $("#first-train-time").val("");
  $("#frequency").val("");
}

 $(document).ready(function() {

  // Populate table at the start and then listen for submit click events for further events.
  populateTable();
  // Install listener for Submit Button
  $("#submit-button").on("click", submitTrainInformation);
});