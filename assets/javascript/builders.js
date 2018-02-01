/* Creates a Loading spinner */

function makeLoading(){

    let spinner = $("<i>").addClass("fa fa-spinner fa-spin");
    return $("<p>").text("Loading ").append(spinner);
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
