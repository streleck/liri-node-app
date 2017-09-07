var Twitter = require('twitter');
var keys = require('./keys.js')
var Spotify = require('node-spotify-api');
var inquirer = require("inquirer");
var request = require("request");
var fs = require("fs");


function menu(){
	inquirer.prompt([
	{
	type: "list",
	message: "Welcome to Liri. What can I help you with?",
	choices: ["Twitter", "Music", "Movies", "Do What It Says"],
	name: "appType" 
	}
	])
	.then(function(inquirerResponse) {
	    if (inquirerResponse.appType == "Twitter") {
	    	console.log("Very well, sir!");
	    	console.log("");;
			inquirer.prompt([
			{
			type: "input",
			message: "Whose tweets would you like to see?",
			name: "user",
			default: "mark_strelecky"
			}
			])
			.then(function(inquirerResponse) {
				getTweets(inquirerResponse.user)
			});   
		}
	    else if (inquirerResponse.appType == "Music"){
	    	console.log("Of course, milord!")
	    	console.log("");
	    	inquirer.prompt([
			{
			type: "input",
			message: "What song would you like to search?",
			name: "song",
			default: "The Sign Ace of Base"
			}
			])
			.then(function(inquirerResponse) {
				getSpotify(inquirerResponse.song, 0)
			});
		}
		else if (inquirerResponse.appType == "Movies"){
	    	console.log("Movies it is, sir.")
	    	console.log("");
	    	inquirer.prompt([
			{
			type: "input",
			message: "And which movie would you like to know about?",
			name: "movie",
			default: "Mr. Nobody"
			}
			])
			.then(function(inquirerResponse) {
				omdb(inquirerResponse.movie)
			});       
	    }
	    else if (inquirerResponse.appType == "Do What It Says"){
	    	readCommand();
	    }
	});
};


function getTweets(user){
	var client = new Twitter(keys.twitterKeys);
	client.get('statuses/user_timeline', {screen_name: user}, function(error, tweets, response) {
		if (!error) {
		  	for (var i = 0; (tweets[i] != undefined) && (i<20); i++){
			  	console.log("");
			  	console.log(">>>>>>>>  " + tweets[i].created_at + "  <<<<<<<<");
			    console.log(tweets[i].text);
			    console.log("")
			};
	  	}
	  	repeat();
	});
};

function getSpotify(song, index){		 
	var spotify = new Spotify(keys.spottifyKeys);	 
	spotify.search({ type: 'track', query: song}, function(err, data) {
	  if (err) {
	    return console.log('Error occurred: ' + err);
	  }
	console.log("")
	console.log("Artist: " + data.tracks.items[index].artists[0].name);
	console.log("Title: " + data.tracks.items[index].name)
	console.log("Link: " + data.tracks.items[index].preview_url)
	console.log("Album: " + data.tracks.items[index].album.name)
	console.log("")
	console.log("")
	index ++;
		inquirer.prompt([
			{
			type: "list",
			message: "Was that the song you were looking for?",
			choices: ["No, you idiot! Try again.", "Yeah. That's the one.", "No that's not it. {sigh} I give up."],
			name: "rightSong" 
			}
			])
			.then(function(inquirerResponse) {
				if (inquirerResponse.rightSong == "Yeah. That's the one."){
					console.log("I'm glad to be of assistance.")
				}
				else if (inquirerResponse.rightSong == "No, you idiot! Try again."){
					console.log("")
					console.log("How about this one?")
					getSpotify(song, index);
				}
				else{
					console.log("I deeply apologise on behalf of Spottify, sir. They can't possibly calalogue EVERY song there is.")
				}
				repeat();
			});
	});
	
};

function omdb(title){

	request("http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=40e9cece", function(error, response, body) {

		if (!error && response.statusCode === 200) {

			console.log("")
			console.log("Title: " + JSON.parse(body).Title);
			console.log("Year: " + JSON.parse(body).Year)
			console.log("IMDB Rating: " + JSON.parse(body).Ratings[0].Value)
			console.log("Rotten Tomatoes: " + JSON.parse(body).Ratings[1].Value)
			console.log("Country: " + JSON.parse(body).Country)
			console.log("Language: " + JSON.parse(body).Language)
			console.log("Plot: " + JSON.parse(body).Plot)
			console.log("Cast: " + JSON.parse(body).Actors)
			console.log("")
			console.log("")

		}
		repeat();
	});
}

function readCommand(){
	fs.readFile("random.txt", "utf8", function(error, data){

		if (error) {
			console.log(error)
		}
		console.log("It says, " + data)
		dataArr = data.split(",");

		if (dataArr[0] == "my-tweets"){
			getTweets(dataArr[1]);
		}
		else if (dataArr[0] == "spotify-this-song"){
			getSpotify(dataArr[1], 0);
		}
		else if (dataArr[0] == "movie-this"){
			omdb(dataArr[1]);
		}
		else if (dataArr[0] == "do-what-it-says"){
			console.log("I'd prefer to avoid an endless loop, sir.")
		}
		else{
			console.log("I can't understand that instruction.")
		}
	});
};

function repeat(){
		inquirer.prompt([
		{
		type: "confirm",
		message: "Is there anything else I can help you with?",
		name: "confirm",
		default: true,
		}
	])
		.then(function(inquirerResponse) {
		    if (inquirerResponse.confirm == true) {
		    	menu();  
			}
		});
};



menu();