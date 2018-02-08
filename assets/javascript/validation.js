function validation(thisForm, artistSearch, locationSearch, whenSearch, nearbySearch, resultsSearch){
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

    function throwError(text) {

        let error = newDiv("text-center container-fluid").attr("id", "error");
        let errorText = $("<p>").css("color", "red").text(text);
        error.append(errorText);
        $("#results").prepend(error);

    }

    /** Data validation goes here **/
    if (artistSearch.length > 30) {

        throwError("Sorry, search names can't be more than 30 characters");

    }
    else if (locationSearch.length > 40) {
        //remove(); element with id created in longLocationHeader

        throwError("Sorry, please limit locations to 40 or fewer characters");

    }
    else if (artistSearch == "" && locationSearch.length > 40) {

        throwError("Please enter a proper location name, zip code, city, or geolocation coordinate");

    }
    else {

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
}