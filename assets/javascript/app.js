const recipeUrl="https://api.edamam.com/search?app_id=e5161b01&app_key=5f83606b6f6bf1a7278cd8ff994302aa&q=";

function getRecipes(q){

	$.ajax({

		method: "GET",
		url: recipeUrl + q

	}).done(function(response){

		console.log(response.hits);

	});
}

getRecipes("pizza rolls");