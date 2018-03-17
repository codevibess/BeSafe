

let globalMarkerList;
let GoogleMap;
let userPosition;
let type;
let description;
let dateAndTime;


function InitFirebase() {  //INIT OF FIREBASE DATABASE
  
    var config = {
        apiKey: "AIzaSyCXHmk5R5kNt97-WThdI354f_SIA10yQ9U",
        authDomain: "besafe-197612.firebaseapp.com",
        databaseURL: "https://besafe-197612.firebaseio.com",
        projectId: "besafe-197612",
        storageBucket: "besafe-197612.appspot.com",
        messagingSenderId: "225644039878"
      };
    firebase.initializeApp(config);

    console.log("InitFirebase");
}

function getFirebaseData() {  //FIREBASE DATA GETTER
    let markerList = [];

    const markers = firebase.database().ref('Marker');
    markers.on('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            markerList.push(childSnapshot.val());
        });
    });

    globalMarkerList = markerList;
    console.log("getFirebaseData");
}

function sendFirebaseData() {
    let [type, description] = gettypeAnddescription();
    let dateAndTime = calculateDate();
    // Reference to your entire Firebase database
    const myFirebase = firebase.database().ref();
    // Get a reference to the recommendations object of your Firebase.
    // Note: this doesn't exist yet. But when we write to our Firebase using
    // this reference, it will create this object for us!
    const marker = myFirebase.child("Marker");

    // Push our first recommendation to the end of the list and assign it a
    // unique ID automatically.
    marker.push({
        "type": type,
        "position": userPosition,
        "description": description,
        "dateAndTime": dateAndTime
    });
    sendToCommandCentralInfo(type, description, dateAndTime);

}

function formMsgSend() {
    const msg = document.getElementById('msgSent');
    msg.innerText = "Your application was sent successfull";
    msg.style = "display:inline-block;";
    const frm = document.querySelector('#description_form');
    frm.reset();  // Reset all form data
    setTimeout(function () { window.location.href = "#t3"; msg.style = "display:none"; }, 900);

    return false; // Prevent page refresh
}
function calculateDate() {
     let today = new Date();
     let dd = today.getDate();
     let mm = today.getMonth() + 1; //January is 0!
     let yyyy = today.getFullYear();
     let hh = today.getHours();
     let min = today.getMinutes();

    if (dd < 10) { dd = '0' + dd }
    if (mm < 10) { mm = '0' + mm }
    today = "Date: " + mm + '/' + dd + '/' + yyyy + " Time: " + hh + ":" + min;
    dateAndTime = today;
    return today;
}

function initMap() {
    let map = new google.maps.Map(document.getElementById('map'), { zoom: 15 });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            userPosition = pos;

            map.setCenter(pos);
           
            var marker = new google.maps.Marker({
                position: pos,
                map: map,
                title: 'your location',
                anchorPoint: new google.maps.Point(0, -2),
                draggable: true

            });
            google.maps.event.addListener(marker, 'dragend', function () {
                pos = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() }
                userPosition = pos;
                handleMarkerInsert(); 
                window.location.href = "#t2";

            })
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

    GoogleMap = map;
    console.log("MapINIT");
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function gettypeAnddescription() {
    let type = document.getElementById("Select-Section").value;
    let description = document.getElementById('POST-name').value;



    return [type, description];
}

function handleMarkerInsert() {
    if (globalMarkerList) {
        globalMarkerList.forEach(marker => {
            let temp_icon;
            switch (marker.type) {
                case 'Car accident':
                    temp_icon = './img/car-collision.png';
                    break;
                case 'Lost item':
                    temp_icon = './img/lost-items.png';
                    break;
                case 'Murder accident':
                    temp_icon = './img/stab-wounds.png';
                    break;
                case 'Theft accident':
                    temp_icon = './img/thief.png';
                    break;

                default:
                    break;

            }
            let mapmarker = new google.maps.Marker({
                position: marker.position,
                map: GoogleMap,
                title: marker.description,
                icon: temp_icon
            });
            let contentString = `
            <p class="h1 font-weight-bold text-center text-danger" >${marker.type}.</p>
            <br>
            <p class="h3 font-weight-normal text-danger">${marker.description}</p>
            <br>
            <p class="h5 font-italic text-danger">${marker.dateAndTime}</p>
            </div>
            `;

            let infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            mapmarker.addListener('click', function () {
                infowindow.open(GoogleMap, mapmarker);
            });
            console.log("handleMarkerInsert");
        }
        )
    }
}


//FOR MOTOROLA SOLUTIONS
function sendToCommandCentralInfo(type, description, dateAndTime) {
    const eventBody = {
        "metaHeader": {
            // Date, when event really occured
            "metaTimeStamp": "2018-03-01T15:00:00.000Z",
            // Label
            "metaEventtypeLabel": "John"
        },
        "eventHeader": {
            // Unique event ID
            "id": "officer-john-1",
            // Descriptive Label
            "label": "Officer John 1",
            // Event reported
            "timeStamp": "2018-03-01T15:00:00.000Z",
            "location": {
                // map coordinates - latitude
                "latitude": 50.051854,
                // map coordinates - longitude
                "longitude": 19.941407
            },
            // detailed description - visible in map popup
            "detaileddescription": "Officer John - found a homeless person taking drugs.",
            "icon": {
                // icon url - could be custom source, or predefined (format MsiIcon://{name})
                "url": "MsiIcon://ic_unit_police_sirens"
            },
            // timestamp, when event will expire (gone from map and layers panel)
            "expirationTimeStamp": "2018-03-01T16:00:00.000Z",
            // available priorities: 'emergency' | 'high' | 'medium' | 'low' | 'diagnostic' | 'unknown'
            // emergency priority is treated specially (events are marked red)
            "priority": "high",
            // an array of attachments
            "attachments": [
                {
                    // Title of Attachment
                    "name": "Incident Location (external)",
                    // content type
                    // see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIMEtypes
                    "contenttype": "application/link",
                    // url to source
                    "url": "https://goo.gl/maps/Yiz4TLDBF3L2"
                }, {
                    "name": "Incident image",
                    "contenttype": "image/jpeg",
                    "url": "https://www.motorolasolutions.com/content/dam/msi/images/en-xw/brand_stories/lte-broadband-lex-brandstory-1160x308.jpg"
                }
            ]
        }
    };

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://hacknarok.release.commandcentral.com/",
        "method": "PUT",
        "headers": {
            "Authorization": "Basic QWlkN21zdU5nenU5ZUVq",
            "Content-type": "application/json"
        },
        "data": eventBody
    }

    $.ajax(settings).done(function (response) {
        console.log(response);
    });
}