

const eventful_api_key = `G6bFxWDSpqCDTwjr`;                           // Eventful API Key
const yt_api_key = `AIzaSyA07NHdSXAhv8cLIyND8qsb4Uvwt0-DVgE`;    // YouTube API Key
const google_places_key = `AIzaSyDvotQLuJNpv-ba_5nzrBnkAzZP6DutQ7E`;    // Google Places API Key

function getEvents(q,where,date,results) // We should pass more arguments based on the userser searches
{

    // API Query parameters
    var oArgs = {
      
      app_key: eventful_api_key,
      q: q, 
      where: where, 
      date: date,
      page_size: results
      
    };

    EVDB.API.call("/events/search", oArgs, function (oData) {


        // Shows the events array from api call
        //console.log(oData.events.event);

        // Events array from api call 
        let eventsArray = oData.events.event;

        // Reders videos for each of the events
        for (let i = 0; i < eventsArray.length; ++i) {


        let event = eventsArray[i]; //The current event
        renderResult(i);

        console.log(event.title);
        console.log(event);
        
        if(i==0){
           makeGoogleMap(event.latitude,event.longitude,"map","parking",1000);
        }

        // If the event has multiple perfomers listed, it gets a video for the name of the first one in the array
        if(typeof(event.performers) === "array"){

            getYouTubeVideo(event.performers[0].name,"video-" + i);        
          
             }

            // If the event has only one performer listed, it searches for that name
            else if (typeof (event.performer) === "object") {
              

              getYouTubeVideo(event.performers.performer.name,"video-" + i);
            
            }


            // Otherwise it gets a video based on the event title
            else {
                getYouTubeVideo(event.title, "video");
            }
          
        // Otherwise it gets a video based on the event title
        else{
            getYouTubeVideo(event.title,"video-" + i);

        }

    });

}

function makeGoogleMap(lat, lon, div, near, radius) {

    var map;
    var infowindow;

    //console.log("lat "  + lat);
    //console.log("lon " + lon);
    //console.log("div " + div);

    /* Below from the Google Places API Documentation */

    function initMap() {
        console.log("init map");
        var pyrmont = {
            lat: parseFloat(lat),
            lng: parseFloat(lon)
        };

        map = new google.maps.Map(document.getElementById(div), {
            center: pyrmont,
            zoom: 15
        });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: pyrmont,
            radius: radius,
            type: [near]
        }, callback);


      function callback(results, status) {
        
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        }
    }

    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });
    }

    /* Above from the Google Places API Documentation */

    initMap();
}

// Searches YouTube for a single video q and appends it to a div

function getYouTubeVideo(q, div) {

    $.get(`https://www.googleapis.com/youtube/v3/search`,
        {
            part: 'snippet, id',
            q: q,
            maxResults: 1,
            type: 'video',
            key: yt_api_key
        }, function (data) {
      
            //console.log(data);
            $("<h1>").text(q).appendTo("#video");
            $("<iframe>").attr("src", "https://www.youtube.com/embed/" + data.items[0].id.videoId)
                .attr("frameborder", "0").appendTo("#" + div);
        });

}


function renderResult(i){


  let videoGoesHere    = $("<div>").addClass("embed-responsive embed-responsive-16by9")
                                   .attr("id","video-" + i);

  let videoCardTitle   = $("<span>").addClass("card-title")
                                    .attr("id","card-title-" + i)
                                    .text("Placeholder");

  let videoCardContent = $("<div>").addClass("card-content")
                                   .append(videoCardTitle);

  let videoCardImage   = $("<div>").addClass("card-image")
                                   .append(videoGoesHere)
                                   .append(videoCardContent);

  let videoCard        = $("<div>").addClass("card")
                                   .append(videoCardImage);

  let videoCol         = $("<div>").addClass("col-xs-4")
                                   .append(videoCard);

  videoCard.appendTo("#results");


}

$(document).ready(function(){

  getEvents("music","Durham","February",10);

});


// Renders all three things at once when data has been returned

// Form submit
