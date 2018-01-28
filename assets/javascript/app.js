const eventful_api_key = `G6bFxWDSpqCDTwjr`;                           // Eventful API Key
const yt_api_key = `AIzaSyA07NHdSXAhv8cLIyND8qsb4Uvwt0-DVgE`;          // YouTube API Key
const google_places_key = `AIzaSyDvotQLuJNpv-ba_5nzrBnkAzZP6DutQ7E`;   // Google Places API Key

function getEvents(q, where, date, results, near) // Gets events from the Eventful API
{
    $("#results").empty();
    // API Query parameters
    var oArgs = {

        app_key: eventful_api_key,
        q: q,
        where: where,
        date: date,
        page_size: results,
        sort_order: "popularity",
        within: 50
    };

    EVDB.API.call("/events/search", oArgs, function (oData) {

        // Events array from api call 

        console.log(oData);

        // If no events are found
        if(oData.events===null){

            console.log("We can't find that");

            let nope          = newDiv("jumbotron text-center container-fluid");
            let nopeHeader    = $("<h2>").text("Sorry, we couldn't find any events like that :(");
            let nopeSubHeader = $("<h4>").text("Try searching for something else");

            nope.append(nopeHeader);
            nope.append(nopeSubHeader);

            $("#results").append(nope);

            return false;

        }

        let eventsArray = oData.events.event;

        for (let i = 0; i < eventsArray.length; ++i) {

            let event = eventsArray[i]; //The current event

            let eventTime = event.start_time;

            let displayTime = timeFormat(eventTime);

            // console.log(moment())
            // Let's get the time and date, the format is YYYY-MM-DD HH:MM:SS

            renderResult(i, event.title, `${displayTime} ${event.venue_address} ${event.city_name}, ${event.region_abbr} ${event.postal_code}`); // Creates a new panel for each of the returned events

            // console.log(event.title);        // Event Title
            console.log(event);              // Event Object
            // console.log(event.performers);   // Event performers

            let search;  // Variable for YouTube Search

            // Sets the search variable based on the event data returned

            if (event.performers === null)
                search = event.title;
            else if (event.performers.performer[0] !== undefined)
                search = event.performers.performer[0].name;
            else
                search = event.performers.performer.name;

            // Renders a YouTube video based on the search and index i 
            getYouTubeVideo(search, i);

            // Renders a Google Map based on the search and index i, the latitude and longitude of the event location
            // The near parameter and 1000 meters 
            getGoogleMap(i, event.latitude, event.longitude, "map-" + i, near, 1000);


        }

    });

}

function getEventById(id,i,header,isSlider) // Gets events from the Eventful API
{

    // API Query parameters
    var oArgs = {

        app_key: eventful_api_key,
        id: id,

    };

    EVDB.API.call("/events/get", oArgs, function (event) {

        // Events array from api call 

        // console.log(event);
        let eventTime = event.start_time;
        let displayTime = timeFormat(eventTime);
        renderResult(i, event.title, `${displayTime} ${event.address} ${event.city}, ${event.region_abbr} ${event.postal_code}`,header,isSlider);
        let search;

        if (event.performers === null)
            search = event.title;
        else if (event.performers.performer[0] !== undefined)
            search = event.performers.performer[0].name;
        else
            search = event.performers.performer.name;
        
        getYouTubeVideo(search, i);
        getGoogleMap(i, event.latitude, event.longitude, "map-" + i, "parking", 1000);

    });

}


// Renders a Google Map

function getGoogleMap(i, lat, lon, div, near, radius) {

    // Renders the card title for the map
    let nearText = near;
    if(near == "restaurant"){
        nearText = "Restaurants";
    } 
    else if (near == "parking"){
        nearText = "Parking";
    };
    $("#map-title-" + i).text(`${nearText} within ${radius}M`);

    /* Below from the Google Places API Documentation */

    var map;
    var infowindow;

    function initMap() {

        //console.log("init map");

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

function getYouTubeVideo(q, i) {

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

            // If the total results are 0, appends a gif of TV static, otherwise it appends the video

            if (data.pageInfo.totalResults === 0) {

                $("#video-title-" + i).text("Not Found");
                $("<img>").attr("src", "assets/images/static.gif")
                    .appendTo("#video-" + i);

            }
            else {

                let link = $("<a>").attr("href","https://www.youtube.com/results?search_query=" + q)
                                   .attr("target","_blank")
                                   .text("Watch More →");
                $("#video-title-" + i).empty();
                $("#video-title-" + i).append(link);
                $("<iframe>").attr("src", "https://www.youtube.com/embed/" + data.items[0].id.videoId)
                    .attr("frameborder", "0").appendTo("#video-" + i);

            }
        });

}

// Returns a div with the classes passed as a parameter

function newDiv(addClass) {

    return $("<div>").addClass(addClass);

}

// Returns a span with the classes passed as a parameter

function newSpan(addClass) {

    return $("<span>").addClass(addClass);

}

// Creates a column based on the element name and the index i

function createCol(element, i) {

    // Where the element showing data (videos maps) is rendered

    let dataGoesHere = newDiv("embed-responsive embed-responsive-16by9")
        .attr("id", element + "-" + i);

    // Where the title of the element is rendered

    let cardTitle = newSpan("card-title")
        .attr("id", element + "-title-" + i)
        .text("Loading...");

    /* Below are CSS styles from the BandCram template */

    let cardContent = newDiv("card-content")
        .append(cardTitle);

    let cardImage = newDiv("card-image")
        .append(dataGoesHere)
        .append(cardContent);

    let card = newDiv("card")
        .append(cardImage);

    /* Above are CSS styles from the BandCram template */


    // Adds the card to a column
    let col = newDiv("col-xs-4")
        .append(card);

    // Returns all the nested elements together
    return col;

}

function renderResult(i,title,desc,header,isSlider){

  // The panel for each element in the search list
  let panel = newDiv("panel-body");

  if(header !== undefined){
    let panelHeader = newDiv("panel-title").text(header);
    panel.append(panelHeader);
  }

  // The title of the panel
  let panelTitle = $("<h1>").text(title);

    // The subtitle of the panel
    let panelDesc = $("<p>").text(desc);

    panel.append(panelTitle);
    panel.append(panelDesc);

    // The row where the content is going to be added 
    let row = newDiv("row");


    // Placeholder
    let phCol = createCol("ph", i);

    row.append(phCol);

    // Map
    let mapCol = createCol("map", i);

    row.append(mapCol);

    // Video
    let videoCol = createCol("video", i);

    row.append(videoCol);

    panel.append(row);

    let topPanel = newDiv("panel panel-default").attr("id","panel-" + i);

    topPanel.append(panel);

    // If the items are sliders
    if(isSlider){

        // Adds the item class so that the divs spin in the carousel
        topPanel.addClass("item");

        // If the index is 0, it sets it to be the first one displayed
        if(i===0)
            topPanel.addClass("active");

        // appends the new panel to the carousel
        $("#carousel").append(topPanel);

        // If it's the last one in the list, it turns the carousel on autoplay
        if(i===3)
        {
            $('.carousel').carousel({
                interval: 2000
            }); 
        }

    }
    else{
        // Appends the new panel to the results div
        $("#results").append(topPanel);
    }


}


function timeFormat(eventTime) {
    let eventTimeFormat = moment(eventTime).format("dddd, MMMM Do YYYY, h:mm a");
    return eventTimeFormat;
}

const ourPicks = [

  { 
    name: "David's Pick",
    id: "E0-001-106661781-3"
  },{
    name: "Peter's Pick",
    id: "E0-001-109109643-8"
  },{
    name: "Ziad's Pick",
    id: "E0-001-106273043-5"
  },{
    name: "Jen's Pick",
    id: "E0-001-109918478-4"
  }

];


$(document).ready(function(){

    let myLat;
    let myLon;
    let initialSearch = true;

    if(navigator.geolocation) 
    {
       navigator.geolocation.getCurrentPosition(function(position){
    
            myLat = position.coords.latitude;
            myLon = position.coords.longitude;
       });  
    }
    
    
    $("#user-search-1, #user-search-2").submit(function( event ) {
        event.preventDefault();
        let thisForm = this.id.split("-")[2];
        let artistSearch   = $("#input-artist-" + thisForm).val().trim();
        let locationSearch = $("#input-location-" + thisForm).val().trim();
        let whenSearch     = $("#input-date-" + thisForm).val().trim();
        let nearbySearch   = $("#input-nearby-venue-" + thisForm).val().trim();
        let resultsSearch  = $("#input-results-" + thisForm).val().trim();
        
        if (whenSearch == 1) {
            var searchTime = "This Week";
        } else if (whenSearch == 2) {
            var searchTime = "Next Week"
        } else if (whenSearch == 3) {
            var searchTime = moment().format("MMMM");
        } else if (whenSearch == 4) {
            var searchTime = moment().add(1, "M").format("MMMM");
        };

        if (locationSearch == "Near Me" || locationSearch == "") {
           locationSearch = `${myLat}, ${myLon}`;
        };
        
        getEvents(artistSearch, locationSearch, searchTime, resultsSearch, nearbySearch);
       
        if(initialSearch){

            // Hides the main search bar
            $(".first-search-row").css("display","none");
            $("#user-search-1").css("display","inline");

            //Stops the running carousel and empties the sliders div
            $('.carousel').carousel("pause"); 
            $("#sliders").empty();
            $("#sliders").css("display","none");

            // Makes sure this method only runs once!
            initialSearch = false;
        }

    });

    //getEvents("comedy","St Louis","February",10,"parking");

    // Carousel Events
    $("#play").on("click",function(){
        $('.carousel').carousel({
                interval: 2000
        }); 
    });
    $("#pause").on("click",function(){
        $('.carousel').carousel("pause"); 
    });

    for(let i=0; i<ourPicks.length; ++i){
      getEventById(ourPicks[i].id,i,ourPicks[i].name,true);
    }

});
