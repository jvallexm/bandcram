

// Eventful search

// Bandsintown search

// Youtube search

const yt_api_key = `AIzaSyA07NHdSXAhv8cLIyND8qsb4Uvwt0-DVgE`; //YouTube API Key

// Searches YouTube for a single video q and returns a Youtube video iframe

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
              $("<iframe>").attr("src", "https://www.youtube.com/embed/" + data.items[0].id.videoId)
             			   .attr("frameborder","0").appendTo("#" + div);

          });
    
}

$(document).ready(function(){

	getYouTubeVideo("village people","video");

});


// Renders all three things at once when data has been returned

// Form submit
