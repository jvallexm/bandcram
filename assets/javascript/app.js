

const eventful_api_key = `G6bFxWDSpqCDTwjr`;                        // Eventful API Key
const yt_api_key       = `AIzaSyA07NHdSXAhv8cLIyND8qsb4Uvwt0-DVgE`; // YouTube API Key


function getEvents(q,where)
{

   // API Query parameters
   var oArgs = {

      app_key: eventful_api_key,
      q: q,
      where: where, 
      "date": "february",
      page_size: 10

   };

   EVDB.API.call("/events/search", oArgs, function(oData) {

      // Shows the events array from api call
      console.log(oData.events.event);

      // Events array from api call 
      let eventsArray = oData.events.event;

      // Reders videos for each of the events
      for(let i = 0 ; i < eventsArray.length ; ++i){

        let event = eventsArray[i]; //The current event

        // If the event has multiple perfomers listed, it gets a video for the name of the first one in the array
        if(typeof(event.performer) === "array"){   
            getYouTubeVideo(event.performer[0].name);        
        }

        // If the event has only one performer listed, it searches for that name
        else if(typeof(event.performer) === "object"){
            getYouTubeVideo(event.performer.performer.name);
        }

        // Otherwise it gets a video based on the event title
        else{
            getYouTubeVideo(event.title);
        }
          
      }

    });

}

// Searches YouTube for a single video q and appends it to a div

function getYouTubeVideo(q,div){

    $.get(`https://www.googleapis.com/youtube/v3/search`, 
    	  {		
              part: 'snippet, id',
              q: q,
              maxResults: 1,
              type: 'video',
              key: yt_api_key

          },function(data){

          	  console.log(data);
              $("<h1>").text(q).appendTo("#video");
              $("<iframe>").attr("src", "https://www.youtube.com/embed/" + data.items[0].id.videoId)
             			   .attr("frameborder","0").appendTo("#video");

          });
    
}

$(document).ready(function(){

	getYouTubeVideo("village people","video");
  getEvents("music","Durham");

});


// Renders all three things at once when data has been returned

// Form submit
