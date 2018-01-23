

// Eventful search

// Bandsintown search

// Youtube search

const yt_api_key = `AIzaSyA07NHdSXAhv8cLIyND8qsb4Uvwt0-DVgE`; //YouTube API Key

// Searches YouTube for a single video q and returns a Youtube video iframe

function getYouTubeVideo(q){

    $.get(`https://www.googleapis.com/youtube/v3/search`, 
    	  {		
              part: 'snippet, id',
              q: q,
              maxResults: 1,
              type: 'video',
              key: yt_api_key

          },function(data){

              console.log(data);

          });
}

getYouTubeVideo("village people");

// Renders all three things at once when data has been returned

// Form submit
