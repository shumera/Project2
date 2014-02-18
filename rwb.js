//
// Global state
//
// map     - the map object
// usermark- marks the user's position on the map
// markers - list of markers on the current map (not including the user position)
// 
//

//
// First time run: request current location, with callback to Start
//

$("document").ready(function() {
  // Set variables for the different IDs
  // IDs set by perl script writting in html
  var committees = document.getElementById("committees");
  var individuals = document.getElementById("individuals");
  var candidates = document.getElementById("candidates");
  var opinions = document.getElementById("opinions");

  var Cycles = document.getElementById("cycles");
  Cycles.options[2].selected = true;

});

if (navigator.geolocation)  {
    navigator.geolocation.getCurrentPosition(Start);
}


function UpdateMapById(id, tag) {
    // Demarked different params (commttee, individuals, etc.) as differnt colored pins
    var bluePin = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
    var redPin = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
    var greenPin = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
    var yellowPin = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/yellow-dot.png");
    var target = document.getElementById(id);
    var data = target.innerHTML;

    var rows  = data.split("\n");
   
    for (i in rows) {
    	var cols = rows[i].split("\t");
    	var lat = cols[0];
    	var long = cols[1];
    	if (id === "committee_data"){
    		markers.push(new google.maps.Marker({ map:map,
    						      icon: bluePin,
    						    position: new google.maps.LatLng(lat,long),
    						    title: tag+"\n"+cols.join("\n")}));
    	}else if (id === "candidate_data"){
    		 markers.push(new google.maps.Marker({ map:map,
                                                          icon: redPin,
                                                        position: new google.maps.LatLng(lat,long),
                                                        title: tag+"\n"+cols.join("\n")}));
    	}else if (id === "individual_data"){
    		 markers.push(new google.maps.Marker({ map:map,
                                                          icon: greenPin,
                                                        position: new google.maps.LatLng(lat,long),
                                                        title: tag+"\n"+cols.join("\n")}));
    	}else{
    		 markers.push(new google.maps.Marker({ map:map,
                                                          icon: yellowPin,
                                                        position: new google.maps.LatLng(lat,long),
                                                        title: tag+"\n"+cols.join("\n")}));
    	}
      }
}

function ClearMarkers()
{
    // clear the markers
    while (markers.length>0) { 
	markers.pop().setMap(null);
    }
}


function UpdateMap()
{
    var color = document.getElementById("color");
    
    color.innerHTML="<b><blink>Updating Display...</blink></b>";
    color.style.backgroundColor='white';

    ClearMarkers();

    UpdateMapById("committee_data","COMMITTEE");
    UpdateMapById("candidate_data","CANDIDATE");
    UpdateMapById("individual_data", "INDIVIDUAL");
    UpdateMapById("opinion_data","OPINION");


    color.innerHTML="Ready";
    
    if (Math.random()>0.5) { 
	color.style.backgroundColor='blue';
    } else {
	color.style.backgroundColor='green';
    }

}

function NewData(data)
{
  var target = document.getElementById("data");
  
  target.innerHTML = data;

  UpdateMap();

}

function SelectedCycles() {
  var Cycles = document.getElementById('cycles');
  var x = 0;
  var arr = [];
  for (x=0;x<Cycles.options.length;x++) {
    if (Cycles.options[x].selected == true) {
      arr.push(Cycles.options[x].value);
    }
  }
  return arr;
}


function ViewShift()
{
    var bounds = map.getBounds();

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var color = document.getElementById("color");

    color.innerHTML="<b><blink>Querying...("+ne.lat()+","+ne.lng()+") to ("+sw.lat()+","+sw.lng()+")</blink></b>";
    color.style.backgroundColor='white';
    sCycles = SelectedCycles();
    var queryString = "rwb.pl?act=near&latne="+ne.lat()+"&longne="+ne.lng()+"&latsw="+sw.lat()+"&longsw="+sw.lng();
    queryString += "&cycle=" + sCycles.toString() +"&format=raw";

    //Check to see if checkboxes checked
    if(committees.checked && individuals.checked && candidates.checked && opinions.checked 
      || !committees.checked && !individuals.checked && !candidates.checked && !opinions.checked){
      queryString += "&what=all";
      console.log(queryString);
      $.get(queryString, NewData);
    }else{
      var pushData = "";
      var pushArray = [];
      //Check which checkboxes are checked
      if(committees.checked){
        pushArray.push("committees");
      }
      if(candidates.checked){
        pushArray.push("candidates");
      }
      if(individuals.checked){
        pushArray.push("individuals");
      }
      if(opinions.checked){
        pushArray.push("opinions");
      }

      pushData = pushArray.join(',');
      queryString += "&what=" +pushData;
      console.log(queryString);
      $.get(queryString,NewData);
    }
}


function Reposition(pos)
{
    var lat=pos.coords.latitude;
    var long=pos.coords.longitude;

    map.setCenter(new google.maps.LatLng(lat,long));
    usermark.setPosition(new google.maps.LatLng(lat,long));
}


function Start(location) 
{
  var lat = location.coords.latitude;
  var long = location.coords.longitude;
  var acc = location.coords.accuracy;
  
  var mapc = $( "#map");

  map = new google.maps.Map(mapc[0], 
			    { zoom:16, 
				center:new google.maps.LatLng(lat,long),
				mapTypeId: google.maps.MapTypeId.HYBRID
				} );
  var purplePin = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/purple-dot.png");
  usermark = new google.maps.Marker({ map:map,
				icon: purplePin,
					    position: new google.maps.LatLng(lat,long),
					    title: "You are here"});

  markers = new Array;

  var color = document.getElementById("color");
  color.style.backgroundColor='white';
  color.innerHTML="<b><blink>Waiting for first position</blink></b>";

  google.maps.event.addListener(map,"bounds_changed",ViewShift);
  google.maps.event.addListener(map,"center_changed",ViewShift);
  google.maps.event.addListener(map,"zoom_changed",ViewShift);

  navigator.geolocation.watchPosition(Reposition);
}