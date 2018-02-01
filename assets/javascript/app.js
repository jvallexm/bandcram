
const eventful_api_key  = `G6bFxWDSpqCDTwjr`;                           // Eventful API Key
const yt_api_key        = `AIzaSyA07NHdSXAhv8cLIyND8qsb4Uvwt0-DVgE`;    // YouTube API Key
const google_places_key = `AIzaSyDvotQLuJNpv-ba_5nzrBnkAzZP6DutQ7E`;    // Google Places API Key

// Global Variables

let timerOn           = false;  // The timer for queued functions
let queuedMaps        = [];     // The functions queded
let sliderLoadedCount = 0;      // How many sliders have been loaded on page load

/* Creates a Loading spinner */

function makeLoading(){

    let spinner = $("<i>").addClass("fa fa-spinner fa-spin");
    return $("<p>").text("Loading ").append(spinner);
}

/* Callback function for slider on initial load */

function sliderMapCallback() {

    sliderLoadedCount++;  // Increments how many sliders have loaded

    // Once all four sliders have loaded, it adds them to the carousel

    if (sliderLoadedCount === 4) {

        for (let i = 1; i < 4; i++) {
            $("#panel-" + i).appendTo("#carousel");
        }

        $('.carousel').carousel({          // Makes the carousel play
            interval: 4000
        });

    }

}

/* Makes a new nope div */

function makeNope(h2,h4){

    let nope          = newDiv("jumbotron text-center container-fluid");
    let nopeHeader    = $("<h2>").text(h2);
    let nopeSubHeader = $("<h4>").text(h4);

    nope.append(nopeHeader);
    nope.append(nopeSubHeader);

    $("#results").append(nope);
}

/* Gets events by searching the Eventful API */

function getEvents(q, where, date, results, near){

    timerOn    = false; // Resets the timer
    queuedMaps = [];    // Resets the map queue

    $("#results").empty(); // Empties any previous results

    // API Query parameters
    var oArgs = {

        app_key:    eventful_api_key, // API Key
        q:          q,                // Search query
        where:      where,            // Place to search for events near
        date:       date,             // Time period from which to find events
        page_size:  results,          // Maximum number of results
        sort_order: "popularity",     // Sorts results by populatrity
        within:     50                // Event radius

    };

    // Calls from the Eventful API using oArgs as the search 

    EVDB.API.call("/events/search", oArgs, function (oData) {

        // If no events are found it lets the user know by displaying a newly created error screen

        if (oData.events === null) {


            makeNope("Sorry, we couldn't find any events like that :(","Try searching for something else");
            return false; // Returns after null search 

        }

        let eventsArray = oData.events.event; // Reference to the events gotten from the API

        console.log(`Events array ${eventsArray.length} Results ${results}`);


        for (let i = 0; i < eventsArray.length; ++i) {

            let event       = eventsArray[i];        // Reference to the current event
            let eventTime   = event.start_time;      // Reference to the event start time
            let displayTime = timeFormat(eventTime); // Converts the start time to a readable format
            let space = " "
            let eventDesc = `${event.venue_name} -- ${event.venue_address} ${event.city_name}, ${event.region_abbr} ${event.postal_code}`;

            // Creates a new panel for each of the returned events

            let image = "BAD_URL";
            
            if(event.image !== null)
                image = event.image.medium.url;

            renderResult(i, event.title, image, `${event.venue_address} ${event.city_name}, ${event.region_abbr} ${event.postal_code} -- ${displayTime}`); 



            let search;  // Variable for YouTube Search

            // Sets the search variable based on the event data returned

            if (event.performers === null)                        // If no performers are listed
                search = event.title;

            else if (event.performers.performer[0] !== undefined) // If multiple performers are listed
                search = event.performers.performer[0].name;

            else                                                  // if only one performer is listed 
                search = event.performers.performer.name;         
      
            // populate PH column event information and buy tickets link based on the event and postal code index i 
            setEventPlaceHolder(i, event.title, event.venue_name, displayTime, event.postal_code);

            // Renders a YouTube video based on the search and index i 
            getYouTubeVideo(search, i);

            // Renders a Google Map based on the search and index i, the latitude and longitude of the event location
            // The near parameter and 1000 meters 
            getGoogleMap(i, event.latitude, event.longitude, "map-" + i, near, 1000, event.postal_code, event.venue_name);


        }

        if(eventsArray.length < results){
            console.log("results not enough");
            makeNope(`Sorry, we could only find ${eventsArray.length} events`,"Try searching for something else");
        }

    });

}

function setEventPlaceHolder(i, title, venue, time, postalCode)
{
    $("#ph-" + i).empty();
    var div = $("<div/>");
    div.css({
        "width" : "600px",
        "border" : "transparent",
        "margin" : "20px",
        "font-size" : "18px",
        "font-family": "Arial, Helvetica, sans-serif",
        "font-weight" : "bold",
        "color" : "blue"
    });
    var datetime = time.split(",");
    var day = $("<h4>");
    var time = $("<h4>");
    day.text(datetime[0] + "-" + datetime[1]);
    time.text(datetime[2]);
    div.append(day);
    div.append(time); 
    //div.text(venue + "\n" + time);
    div.appendTo($("#ph-" + i));

    $.ajax({
        url: 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=QR6TCULKNJlCHH4Fnx81eS9JvBqjzr0c&keyword=' + title + '&' + 'postalCode=' + postalCode,
        datatype: "json",
        success: function (e) {;
            console.log(e);
            if (e._embedded !== undefined) {
                if (e._embedded.events !== undefined) {
                    //console.log(e._embedded.events[0].url);
                    let url = e._embedded.events[0].url;
                    if (e._embedded.events[0].priceRanges !== undefined) {
                        var price = $("<h4>");
                        price.text("Pricing Starts @ $" + e._embedded.events[0].priceRanges[0].min);
                        div.append(price);
                        console.log(e._embedded.events[0].priceRanges[0].max);
                        console.log(e._embedded.events[0].priceRanges[0].min);
                    }
                    let link = $("<a>").attr("href", url)
                        .attr("target", "_blank")
                        .text("Buy Tickets →");

                    $("#ph-title-" + i).empty();
                    $("#ph-title-" + i).append(link);
                }
                else {
                    $("#ph-title-" + i).text("No Information on tickets");
                }
            }
            else{
                $("#ph-title-" + i).text("No Information on tickets"); 
            }
        }
    })

    div.appendTo($("#ph-" + i));
}

// Gets single events from the Eventful API for the slider

function getEventById(id, i, header, isSlider) 
{

    // API Query parameters
    var oArgs = {

        app_key: eventful_api_key,
        id: id,

    };

    timerOn = false;

    EVDB.API.call("/events/get", oArgs, function (event) {

        // Events array from api call 

        console.log(event);

        if (event.images === null)
            imageIcon = "assets/images/apple-touch-icon-57x57.png";
        else if (event.images.image[0] !== undefined)
            imageIcon = event.images.image[0].medium.url;
        else
            imageIcon = event.images.image.medium.url;

        let eventTime   = event.start_time;
        let displayTime = timeFormat(eventTime);
        let eventDesc = `${event.venue_name} -- ${event.venue_address} ${event.city_name}, ${event.region_abbr} ${event.postal_code}`;

        renderResult(i, event.title, imageIcon, eventDesc, header, isSlider);

        let search;

        if (event.performers === null)
            search = event.title;
        else if (event.performers.performer[0] !== undefined)
            search = event.performers.performer[0].name;
        else
            search = event.performers.performer.name;
        
        setEventPlaceHolder(i, event.title, event.venue_name, displayTime, event.postal_code);
        getYouTubeVideo(search, i);
        getGoogleMap(i, event.latitude, event.longitude, "map-" + i, "parking", 1000, event.postal_code, event.venue_name, true);

    });

}

// Function for when we hit the per second search limit for Google Maps when rendering markers

function initTimer() {

    timerOn = true;    // Turns the global timer on

    setTimeout(() => { // After 2 seconds, it will itterate through the queue of maps to be rendered and run them

        while (queuedMaps.length > 0) {

            let func = queuedMaps.shift(); // Function queued
            func();                        // Runs the queued function
        }

        timerOn = false; // Once it's done, it turns the timer off

    }, 2000);
}

// Renders a Google Map

function getGoogleMap(i, lat, lon, div, near, radius, postalcode, address, isSlider) {

    // Renders the card title for the map
    let nearText = near;

    if (near == "restaurant") {
        nearText = "Restaurants";
    }
    else if  (near == "bar") {
        nearText = "Bars";
    }
    else if (near == "parking") {
        nearText = "Parking";
    };

    //$("#ph-title-" + i).text(address);

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

        // Searches for nearby based on function parameters

        function nearbySearch() {
            service.nearbySearch({

                location: pyrmont, // Location of event
                radius:   radius,  // How far to search
                type:     [near]   // What nearby to return results for 

            }, function (results, status) {

                if (status === google.maps.places.PlacesServiceStatus.OK) {     // If the status is OK, it renders markers

                    $("#map-title-" + i).text(`${nearText} within ${radius}M`);
                    callbackMap(results, status);

                } else if (status !== "ZERO_RESULTS") {  // If the status isn't zero results and isn't OK

                    queuedMaps.push(nearbySearch); // Adds this function to the maps queue

                    if (!timerOn)    // If the timer isn't already on it initializes the timer
                        initTimer();

                } else { // If there are no results found it appends it to the card title

                    $("#map-title-" + i).text(`No ${nearText} Results Found :(`);

                }

            });
        }

        nearbySearch(); // Runs the nearby search

    }

    function callbackMap(results, status) {

        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
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

        /* if this is a Slider, when it finishes loading it calls the slider callback function */

        if (isSlider) {
            google.maps.event.addListenerOnce(map, 'idle', function () {
                sliderMapCallback();
            });
        }
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

            // If the total results are 0, appends a gif of TV static, otherwise it appends the video

            if (data.pageInfo.totalResults === 0) {

                $("#video-title-" + i).text("Not Found");
                $("<img>").attr("src", "assets/images/static.gif")
                    .appendTo("#video-" + i);

            }
            else {

                let link = $("<a>").attr("href", "https://www.youtube.com/results?search_query=" + q)
                    .attr("target", "_blank")
                    .text("Watch More →");

                $("#video-title-" + i).empty();
                $("#video-title-" + i).append(link);
                $("<iframe>").attr("src", "https://www.youtube.com/embed/" + data.items[0].id.videoId)
                    .attr("frameborder", "0").appendTo("#video-" + i);

            }
        });

}

// Returns a div with the classes passed as a parameter .

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

    let loading = makeLoading();

    let cardTitle = newSpan("card-title")
        .attr("id", element + "-title-" + i)
        .append(loading);

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
    let col = newDiv("col-sm-4")
        .append(card);

    // Returns all the nested elements together
    return col;

}


function renderResult(i,title,imageURL,desc,header,isSlider){

    // The panel for each element in the search list
    let panel = newDiv("panel-body");

    if (header !== undefined) {
        let panelHeader = newDiv("panel-title").text(header);
        panel.append(panelHeader);
    }
  
    let imageDiv = newDiv("artist-image").attr("id", "th-" + i);
    let artistImage= $("<img>").attr('src', imageURL)
                               .addClass("circle-image")
                               .on("error",function(){
                                    console.log("image broke");
                                    $("#th-" + i).remove();
                               });


    imageDiv.append(artistImage);
    panel.append(imageDiv);

    // The title of the panel
    let panelTitle = $("<h1>").text(title);

    // The subtitle of the panel
    //let panelDesc = $("<p>").text(desc);
    let panelDesc = $("<p>")
    panelDesc.append(desc);

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

    let topPanel = newDiv("panel panel-default").attr("id", "panel-" + i);

    topPanel.append(panel);

    // If the items are sliders
    if (isSlider) {

        // Adds the item class so that the divs spin in the carousel
        topPanel.addClass("item");

        // If the index is 0, it sets it to be the first one displayed
        if (i === 0){
            topPanel.addClass("active");
            $("#carousel").append(topPanel);
        } else {

        // appends the new panel to the carousel
            $("#results").append(topPanel);
        }    

        // If it's the last one in the list, it turns the carousel on autoplay

    }
    else {
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
    id: "E0-001-110606044-3"
  },{
    name: "Peter's Pick",
    id: "E0-001-108184646-3"
  },{
    name: "Ziad's Pick",
    id: "E0-001-106273043-5"
  },{
    name: "Jen's Pick",
    id: "E0-001-110566547-2"
  }

];


$(document).ready(function () {

    let myLat;
    let myLon;
    let initialSearch = true;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            myLat = position.coords.latitude;
            myLon = position.coords.longitude;
        });
    }


    $("#user-search-1, #user-search-2").submit(function (event) {

        event.preventDefault();

        let thisForm = this.id.split("-")[2];
        let artistSearch = $("#input-artist-" + thisForm).val().trim();
        let locationSearch = $("#input-location-" + thisForm).val().trim();
        let whenSearch = $("#input-date-" + thisForm).val().trim();
        let nearbySearch = $("#input-nearby-venue-" + thisForm).val().trim();
        let resultsSearch = $("#input-results-" + thisForm).val().trim();

        let searchTime;

        if (whenSearch == 1) {

            searchTime = "This Week";

        } else if (whenSearch == 2) {

            searchTime = "Next Week";

        } else if (whenSearch == 3) {

            searchTime = moment().format("MMMM");

        } else if (whenSearch == 4) {

            searchTime = moment().add(1, "M").format("MMMM");

        };

        if (locationSearch == "Near Me" || locationSearch == "") {

            locationSearch = `${myLat}, ${myLon}`;

        };

        $("#error").remove();

        function throwError(text){

            let error     = newDiv("text-center container-fluid").attr("id","error");
            let errorText = $("<p>").css("color","red").text(text);
            error.append(errorText);
            $("#results").prepend(error);

        }

        /** Data validation goes here **/
        if (artistSearch.length > 30) {
            
            throwError("Sorry, search names can't be more than 30 characters");

        } else if (locationSearch.length > 40) {
            //remove(); element with id created in longLocationHeader

            throwError("Sorry, please limit locations to 40 or fewer characters");

        } else if(artistSearch == "" && locationSearch.length > 40) {

            throwError("Please enter a proper location name, zip code, city, or geolocation coordinate");

        } else {

            getEvents(artistSearch, locationSearch, searchTime, resultsSearch, nearbySearch);

            if (initialSearch) {

                // Hides the main search bar
                $(".first-search-row").css("display", "none");
                $("#user-search-1").css("display", "inline");
                $("#navbar-toggly").css("display", "inline");

                //Stops the running carousel and empties the sliders div
                $('.carousel').carousel("pause");
                $("#sliders").empty();
                $("#sliders").css("display", "none");

                // Makes sure this method only runs once!
                initialSearch = false;
            }

        };

        
        

        // When using expanded search bar at small screen sizes, forces collapse after submit
        $('.navbar-collapse').collapse('hide');

    });

    //getEvents("comedy","St Louis","February",30,"parking");

    // Carousel Events
    $("#play").on("click", function () {
        $('.carousel').carousel({
            interval: 4000
        });
    });

    $("#pause").on("click", function () {
        $('.carousel').carousel("pause");
    });

    for(let i=0; i<ourPicks.length; ++i){
        getEventById(ourPicks[i].id,i,ourPicks[i].name,true);
    }

});
