//images this sketch uses
let imgBattle;
let imgShuttle;
let imgTang;
let imgVenus;
let imgGarbage;
let imgGarbage2;

// currentImg is the image file that we're using, this changes as the night progresses more or less randomly
let currentImg;


let maxXChange = 100; //this number can be ramped up and down to make more or less glitching
let maxYChange = 5;
let hFactor = 20;
let inverted = false;
let glitching = false;

let streakNum = 14;

var socket;

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

	//socket connection code, needs fixing (maybe code in .html file is fucked?)
	//socket = io.connect('http://localhost:1312');

	//function that takes the message from the node server
	//socket.on('sketch1', glitch);

  currentImg = imgTang; //arbitrary
}

function draw() {
  if (glitching == true){
    for (let i = 0; i < streakNum; i++) { //dist(pmouseX, pmouseY, mouseX, mouseY) * 0.04; i++) {
      drawStreak()
    }
	}
  if (glitching == false){
    background(currentImg);
	let rand = random(100);
	if(rand < 10){
	drawStreak();
	}
  }
}

function drawStreak() {
	let y = floor(random(height));
	let h = floor(random(hFactor, hFactor + 10)); 
	let xChange = floor(random(-maxXChange, maxXChange));
	let yChange = floor(xChange * (maxYChange / maxXChange) * random());

	if (random() < .01 && maxXChange != 0) filter(POSTERIZE, floor(random(2, 6)));
	
	
	
	image(currentImg, xChange, -maxYChange + y + yChange, currentImg.width, h, 0, y, currentImg.width, h);
	//copy(img, 0, y, img.width, h, xChange - maxXChange, -maxYChange + y + yChange, img.width, h);
}

function mouseClicked(){ 
  //this will be hooked up to a timer function so it happens automatically
  randomizeImg();
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
}

function glitch(data){
	glitching = !glitching;
	console.log(data.note + " " + data.vel);
}

function randomizeImg(){
  let randomNum = round(random(4));
  console.log(randomNum);
	//if I want to I could have random with no repeats but I don't know if it's worth the effort
  if (randomNum == 4){
    currentImg = imgBattle;
  }else{
    if (randomNum == 1){
      currentImg = imgShuttle
    }else{
      if(randomNum == 2){
        currentImg = imgTang;
      }else{
        if (randomNum == 3){
          currentImg = imgVenus;
        }
      }
    }
  }
}
//Part of my vision is having the garbage pictures only appear as a part of glitching
//So the above function can be set up to work on a millis timer, so like every X seconds there's a random chance of an image changing and the timer resets

//function mouseClicked() {
//  glitching = !glitching;
//}

// have glitching parameters be changed with CC's? That would also be emmitted from the server side

//I'm thinking that we could have the range finders cause the streaking and the RFID scanning cause the garbage images to flash up