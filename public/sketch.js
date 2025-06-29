//images this sketch uses
let imgBattle;
let imgShuttle;
let imgTang;
let imgVenus;
let imgGarbage;
let imgGarbage2;

// currentImg is the image file that we're using, this changes as the night progresses more or less randomly
let currentImg;
let subversiveImg;

//Glitching variables
let maxXChange = 100; //this number can be ramped up and down to make more or less glitching
let maxYChange = 5;
let hFactor = 20;
let inverted = false;
let glitching = false;
let streakNum = 14;

//Variable for sockets
var socket;

//Variable for "strobe" effect
let flashGlitch = false;
let flashGlitchSequence = 0;
let blockNum = 10;
let screenBlocking = false;

//variables for the timing of random image changes
let time;
let prevTime = 0;
let interval = 10000;

let glitchCooldownInterval; //randomly set when a glitch trigger is sent
let glitchCooldownTimer; //This is fixed at a time when the trigger is sent and then it flips back around when it 
let flashCooldownInterval; //also 
let flashCooldownTimer;
let streakCooldownTimer;


//Loading all our images
function preload() {
  imgBattle = loadImage("assets/battle.jpg");
  imgShuttle = loadImage("assets/shuttle.jpg");
  imgTang = loadImage("assets/tang.jpg");
  imgVenus = loadImage("assets/venus.jpg");
  imgGarbage = loadImage("assets/garbage.jpg");
  imgGarbage2 = loadImage("assets/garbage2.png");
}


function setup() {
	createCanvas(windowWidth, windowHeight);
	background(255);

 	imgTang.resize(width,height);
	imgTang.filter(POSTERIZE, 5);
	image(imgTang, -maxXChange, -maxYChange);
	
 	imgBattle.resize(width,height);
	imgBattle.filter(POSTERIZE, 5);
	
 	imgShuttle.resize(width,height);
	imgShuttle.filter(POSTERIZE, 5);
	
 	imgVenus.resize(width,height);
	imgVenus.filter(POSTERIZE, 5);

	imgGarbage.resize(width,height);
	imgGarbage.filter(POSTERIZE, 5);
		
	imgGarbage2.resize(width,height);
	imgGarbage2.filter(POSTERIZE, 5);

	//socket connection code, doensn't work unless node server is running 
	socket = io.connect('http://localhost:1312');

	//function that takes the message from the node server and runs a function depending on what comes in (do the functions need to have parentheses?)
	socket.on('glitch', glitch); // For this one specifically we need to have a cooldown timer where the message to unglitch is sent, either in arduino or node
	socket.on('flash', flashGlitchActivate); //flips a boolean
	
	//arbitrary, just need to set something here
	currentImg = imgTang; 
	subversiveImg = imgGarbage;
}

function draw() {
  
  //Code to randomize image
	time = millis();
	if((time - prevTime) >= interval){
		prevTime = time;
		let randNum = random(10);
		if(randNum > 3.3){
			randomizeImg();
			console.log("Randomizing");
			}
	if(randNum < 3.3){
			incrementStreak();
		}else{
			if(randNum < 6.6 && randNum > 3.3){
				decrementStreak();
			}else{
				if(randNum > 6.6){
					randomizeStreak();
				}
			}
		}
	}
  
  //Glitch streak code
  if (glitching == true && flashGlitch == false){
    for (let i = 0; i < streakNum; i++) { //dist(pmouseX, pmouseY, mouseX, mouseY) * 0.04; i++) {
      drawStreak(currentImg);
		}
	}

	if (glitching == true && flashGlitch == true){
		for (let i = 0; i < streakNum; i++) {
			let randNum = round(random(5));
			if(i % randNum == 0){
				drawStreak(subversiveImg);
			}else{
				drawStreak(currentImg);
			}	
		}
	}

  if (glitching == false && flashGlitch == false){
    background(currentImg);
	let rand = random(100);
	if(rand < 10){
	drawStreak(currentImg);
	}
  }
	
  //Flash glitch code
  if (flashGlitch == true && glitching == false){
	flashGlitchGo();
  }

  if (screenBlocking == true){
	screenBlocks();
  }
  //code to flip glitching back off after cooldown time
  if(glitching == true){ //if glitching is active
	if(time - glitchCooldownTimer > glitchCooldownInterval){
		glitching = false;
	}
  }
  //doing same thing with flashing
  if(flashGlitch == true){
	if(time - flashCooldownTimer > flashCooldownInterval){
		flashGlitch = false;
	}
  }
}

function drawStreak(ourImg) {
	let y = floor(random(height));
	let h = floor(random(hFactor, hFactor + 10)); 
	let xChange = floor(random(-maxXChange, maxXChange));
	let yChange = floor(xChange * (maxYChange / maxXChange) * random());

	if (random() < .01 && maxXChange != 0) filter(POSTERIZE, floor(random(2, 6)));
	
	
	
	image(ourImg, xChange, -maxYChange + y + yChange, ourImg.width, h, 0, y, ourImg.width, h);
	//copy(img, 0, y, img.width, h, xChange - maxXChange, -maxYChange + y + yChange, img.width, h);
}

/* For debugging, uncomment if desired
function mouseClicked() {
	glitch();
}

function keyPressed() {
	if (keyCode == UP_ARROW){
		maxXChange = maxXChange + 10;
	}
	if (keyCode == DOWN_ARROW){
		maxXChange = maxXChange - 10;
	}
	if (keyCode == LEFT_ARROW && hFactor > 5){
		hFactor = hFactor - 5;
	}
	if (keyCode == RIGHT_ARROW){
		hFactor = hFactor + 5;
	}
	if (key == 'h'){
		streakNum--;
	}
	if (key == 'l'){
		streakNum++;
	}
	
	//This would be if a certain RFID tag is scanned, key press function is just filling the void currently
	if (key == 'g'){
		flashGlitchActivate();
		console.log("Flash glitch");
	}

}
*/
//These functions are mostly designed to accept triggers from node server and flip booleans. The meaty code is run in the main draw loop
function glitch(){ //runs when specific osc code comes in or mouse is clicked
	if (glitching == false){ //code does nothing if glitching is already happening
	glitching = true;
	glitchCooldownInterval = (random(30000)) + 10000; //Glitching occurs for at least 10 seconds, up to 40 seconds. Change this if desired.
	glitchCooldownTimer = time; //sets cooldown timer to be equal to current time
	}
}

function flashGlitchActivate(){
	if (flashGlitch == false){
	flashGlitch = true; 
	flashCooldownInterval = (random(30000)) + 10000;
	flashCooldownTimer = time;
	}
}

function randomizeImg(){
  let randomNum = round(random(4));
  console.log(randomNum);
	//if I want to I could have random with no repeats but I don't know if it's worth the effort
  if (randomNum == 4){
    currentImg = imgBattle;
	subversiveImg = imgGarbage;
  }else{
    if (randomNum == 1){
      currentImg = imgShuttle
	  subversiveImg = imgGarbage;
    }else{
      if(randomNum == 2){
        currentImg = imgTang;
		subversiveImg = imgGarbage2;
      }else{
        if (randomNum == 3){
          currentImg = imgVenus;
		  subversiveImg = imgGarbage2;
        }
      }
    }
  }
}

function flashGlitchGo(){
	//this might be more effective with pixel mixing, maybe having the pixels blend in and out of each other like in that processing sketch
	let randNum = round(random(2, 4));
	flashGlitchSequence = flashGlitchSequence + randNum;
	if ((flashGlitchSequence % 2) == 0){
		screenBlocking = false;
		background(subversiveImg);
	}else if ((flashGlitchSequence % 3) == 0) {
		screenBlocking = true;
	} else {
		background(currentImg);
	}
}
	
function screenBlocks(){
	noStroke();
	fill(0);
	rect(0, 0, width, height);
	for (let i = 0; i <= blockNum; i++){
		let x = random(width);
		let y = random(height);
		let xLoc = random(width);
		let yLoc = random(height);
		fill(random(255), random(255), random(255));
		rect(xLoc, yLoc, x, y);
	}
}

//Currently these functions are run randomly at regular intervals
function incrementStreak(){
	maxXChange = maxXChange + random(20);
		if(hFactor > 5){
		hFactor = hFactor - 5;
	}
}

function decrementStreak(){
	maxXChange = maxXChange - random(20);
	hFactor = hFactor + 5;

}

function randomizeStreak(){
	streakNum = round(random(20));
}

	/*Each time it cycles through the code
	add a random number between 2 and 4 to our random number
	do a modulo operation 
	if it's even display garbage images
	if it's odd keep with current image

	*/
//Part of my vision is having the garbage pictures only appear as a part of glitching
//So the above function can be set up to work on a millis timer, so like every X seconds there's a random chance of an image changing and the timer resets

// have glitching parameters be changed with CC's? That would also be emmitted from the server side

//I'm thinking that we could have the range finders cause the streaking and the RFID scanning cause the garbage images to flash up
