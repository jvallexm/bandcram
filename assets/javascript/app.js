

const eventful_api_key = `G6bFxWDSpqCDTwjr`;                           // Eventful API Key
const yt_api_key = `AIzaSyA07NHdSXAhv8cLIyND8qsb4Uvwt0-DVgE`;          // YouTube API Key
const google_places_key = `AIzaSyDvotQLuJNpv-ba_5nzrBnkAzZP6DutQ7E`;   // Google Places API Key

function getEvents(q,where,date,results) // We should pass more arguments based on the userser searches
{

    // API Query parameters
    var oArgs = {
      
      app_key: eventful_api_key,
      q: q, 
      where: where, 
      date: date,
      page_size: results,
      sort_order: "popularity"
      
    };

    EVDB.API.call("/events/search", oArgs, function (oData) {

        // Events array from api call 
        let eventsArray = oData.events.event;

        // Reders videos for each of the events
        for (let i = 0; i < eventsArray.length; ++i) {

            let event = eventsArray[i]; //The current event

            renderResult(i,event.title,event.venue_address);

            //console.log(event.title);
            console.log(event);
            console.log(event.performers);
            if(event.performers === null){
              getYouTubeVideo(event.title, i);
            }

            // If the event has multiple perfomers listed, it gets a video for the name of the first one in the array
            else if(typeof(event.performers) === "array"){ 
              getYouTubeVideo(event.performers[i].name, i); 
            }

            // If the event has only one performer listed, it searches for that name
            else if (typeof(event.performers) === "object"){

              getYouTubeVideo(event.performers.performer.name, i);
            
            } else {
              getYouTubeVideo(event.title, i);
            }

            makeGoogleMap(i,event.latitude,event.longitude,"map-" + i,"parking",1000);  


        }

    });

}

function makeGoogleMap(i,lat, lon, div, near, radius){

    var map;
    var infowindow;

    //console.log("lat "  + lat);
    //console.log("lon " + lon);
    //console.log("div " + div);

    /* Below from the Google Places API Documentation */

    $("#map-title-" + i).text(near + " within " + radius + "M");

    function initMap() {

        console.log("init map");

        var pyrmont = {
            lat: parseFloat(lat),
            lng: parseFloat(lon)
        };

        map = new google.maps.Map(document.getElementById(div), {
            center: pyrmont,
            zoom: 14
        });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: pyrmont,
            radius: radius,
            type: [near]
        }, callback);
    }

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

function getYouTubeVideo(q,i) {

    $.get(`https://www.googleapis.com/youtube/v3/search`,
        {
            part: 'snippet, id',
            q: q,
            maxResults: 1,
            type: 'video',
            key: yt_api_key

        }, function (data) {

            //console.log("searched for " + q);
            //console.log(data);

            //$("#video-title-" + i).text(q);

            $("<iframe>").attr("src", "https://www.youtube.com/embed/" + data.items[0].id.videoId)
                .attr("frameborder", "0").appendTo("#video-" + i);

        });

}

function newDiv(addClass){

  return $("<div>").addClass(addClass);

}

function newSpan(addClass){

  return $("<span>").addClass(addClass);

}

function renderResult(i,title,desc){

  let panel = newDiv("panel-body");

  let panelTitle = $("<h1>").text(title);

  let panelDesc = $("<p>").text(desc);

  panel.append(panelTitle);
  panel.append(panelDesc);


  let row = newDiv("row");

  let phGoesHere      = newDiv("embed-responsive embed-responsive-16by9")
                                   .attr("id","ph-" + i);

  let phCardTitle     = newSpan("card-title")
                                    .attr("id","ph-title-" + i)
                                    .text("Placeholder");

  let phCardContent   = newDiv("card-content")
                                   .append(phCardTitle);

  let phCardImage     = newDiv("card-image")
                                   .append(phGoesHere)
                                   .append(phCardContent);

  let phCard          = newDiv("card")
                                   .append(phCardImage);

  let phCol           = newDiv("col-xs-4")
                                   .append(phCard);

  row.append(phCol);

  let mapGoesHere      = newDiv("embed-responsive embed-responsive-16by9")
                                   .attr("id","map-" + i);

  let mapCardTitle     = newSpan("card-title")
                                    .attr("id","map-title-" + i)
                                    .text("Placeholder");

  let mapCardContent   = newDiv("card-content")
                                   .append(mapCardTitle);

  let mapCardImage     = newDiv("card-image")
                                   .append(mapGoesHere)
                                   .append(mapCardContent);

  let mapCard          = newDiv("card")
                                   .append(mapCardImage);

  let mapCol           = newDiv("col-xs-4")
                                   .append(mapCard);

  row.append(mapCol);



  let videoGoesHere    = newDiv("embed-responsive embed-responsive-16by9")
                                   .attr("id","video-" + i);

  let videoCardTitle   = newSpan("card-title")
                                    .attr("id","video-title-" + i)
                                    .text("Watch");

  let videoCardContent = newDiv("card-content")
                                   .append(videoCardTitle);

  let videoCardImage   = newDiv("card-image")
                                   .append(videoGoesHere)
                                   .append(videoCardContent);

  let videoCard        = newDiv("card")
                                   .append(videoCardImage);

  let videoCol         = newDiv("col-xs-4")
                                   .append(videoCard);

  row.append(videoCol);

  panel.append(row);

  let topPanel = newDiv("panel panel-default");

  topPanel.append(panel);

  $("#results").append(topPanel);


}

$(document).ready(function(){

  getEvents("music","Durham","February",10);

});


// Renders all three things at once when data has been returned

// Form submit
