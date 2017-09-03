	var renderer;
	var scene;
	var camera;
	var spotlight;

	var ball;
	var paddle1, paddle2;
	var playerScore, computerScore;
	var playerScoreValue = 0;
	var computerScoreValue = 0;
	var playerScoreObject, computerScoreObject;
	var explode, one, two, three, four, five;

	//Game speed
	var accelFactor = 2;

	//Bool for game state
	var gameStarted = 0;


	//Logic for Start/Stop button
	function startGame()
	{	
		init();
		
		if (gameStarted = 0)
		{
			gameStarted = 1;
			$("#startStopButton").html("End Game");
			init();
		}
		else
		{
			gameStarted = 0;
			$("#startStopButton").html("Start Game");
			scene = new THREE.Scene();
		}

	}
	
	function init()
	{
		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(
		// frustum vertical view         aspect ratio							 frustum near plane     frustum far plane
			45,                          window.innerWidth / window.innerHeight, 0.1,                   1000 );

		setupRenderer();
		setupCamera();
		setupSpotlight();
		
		// Main game functions

		loadSounds();
		createPlayBottom();
		createBoundingWalls();
		createPaddles();
		createBall();
		
		// Output to the stream
		document.body.appendChild( renderer.domElement );
		
		// Call render
		render();
	}

	function render()
	{
		moveBallAndMaintainPaddles();
		//updateScore();
		// Request animation frame
		requestAnimationFrame( render );
		
		// Call render()
		renderer.render( scene, camera );
	}
	
	function setupRenderer()
	{
		renderer = new THREE.WebGLRenderer();
		//						color     alpha
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMapEnabled = true;
	}
	
	function setupCamera()
	{
		camera.position.x = 0;
		camera.position.y = -25;
		camera.position.z = 30;
		camera.lookAt( scene.position );
	}

	function setupSpotlight()
	{
		spotLight = new THREE.SpotLight( 0xffffff );
		spotLight.position.set(10,20,20);
		spotLight.shadowNnear = 20;
		spotLight.shadowFar = 50;
		spotLight.castShadow = true;
		scene.add(spotLight);
	}

	function createPlayBottom()
	{
		var planeGeomtry = new THREE.PlaneGeometry(10,20,10,10);
		var planeMaterial = new THREE.MeshLambertMaterial({color: 'green'});
		var plane = new THREE.Mesh(planeGeomtry, planeMaterial);

		scene.add(plane);
	}

	function createBoundingWalls()
	{	
		var wallMaterial = new THREE.MeshBasicMaterial({color: 'yellow'});

		var leftWall = new THREE.BoxGeometry(1,18,5);
		var wall1 = new THREE.Mesh(leftWall, wallMaterial);
		wall1.position.x = -5;
		scene.add(wall1);

		var edges1 = new THREE.EdgesHelper(wall1, 0x555555);
		scene.add(edges1);

		var rightWall = new THREE.BoxGeometry(1,18,5);
		var wall2 = new THREE.Mesh(rightWall, wallMaterial);
		wall2.position.x = 5;
		scene.add(wall2);

		var edges2 = new THREE.EdgesHelper(wall2, 0x555555);
		scene.add(edges2);
	}

	function createPaddles()
	{
		

		var opponentPaddle = new THREE.BoxGeometry(2, 0.5, 3);
		var playerPaddle = new THREE.BoxGeometry(2, 0.5, 3);

		var paddleMaterial = new THREE.MeshBasicMaterial({color: 'salmon'});

		paddle1 = new THREE.Mesh(opponentPaddle, paddleMaterial);
		paddle2 = new THREE.Mesh(playerPaddle, paddleMaterial);

		paddle1.position.y = 9;
		scene.add(paddle1);

		paddle2.position.y = -9;
		scene.add(paddle2);

		var edges3 = new THREE.EdgesHelper(paddle2, 0x000000);
		scene.add(edges3);
	}

	function createBall()
	{
		
		var ballSphere = new THREE.SphereGeometry(0.5);
		var ballMaterial = new THREE.MeshBasicMaterial({color: 'blue'});

		ball = new THREE.Mesh(ballSphere, ballMaterial);

		scene.add(ball);
	}

	var xDir = (Math.random()*0.4)+0.2 * (Math.random() < 0.5 ? -1 : 1);
	var yDir = (Math.random()*0.4)+0.2 * (Math.random() < 0.5 ? -1 : 1);

	console.log(xDir);
	console.log(yDir);

	function moveBallAndMaintainPaddles()
	{
		//var xDir = accelFactor*0.02;
		//var yDir = 0;//accelFactor*0.04;

		//Random start direction
		//var xDir = (Math.random()*0.4)+0.2;
		//console.log(xDir);
		//var yDir = (Math.random()*0.4)+0.2;
		//console.log(yDir);

		ball.position.x += xDir;
		ball.position.y += yDir;

		//Move player paddle left for 'A' key press
		if(Key.isDown(Key.A))
		{
			paddle2.position.x -= accelFactor*0.02;
		}
		//Move player paddle right for 'D' key press
		else if(Key.isDown(Key.D))
		{
			paddle2.position.x += accelFactor*0.02;
		}

		if(ball.position.x < -4 )//&& Math.abs(xDir) > 1)
		{
			xDir = accelFactor*(0.02);
			three.play();
		}
		else if(ball.position.x > 4 )//&& Math.abs(xDir) < 1)
		{
			xDir = accelFactor*(-0.02);
			four.play();
		}

		//Detect paddle collision Player side
		if( ball.position.y < -8.5 && yDir < 0 )
		{
			yDir = accelFactor*0.04;
			
			if( Math.abs( paddle2.position.x - ball.position.x ) <= 2 )
			{	
				//TODO: bounce direction based on paddle collision location
				xDir = -xDir;
				one.play();
			}
			else
			{
				ball.position.x = ball.position.y = 0;
				explode.play();
			}
		}

		//Detect paddle collision Computer side
		else if( ball.position.y > 8.5 && yDir > 0 )
		{
			yDir = accelFactor*(-0.04);
			
			if( Math.abs( paddle1.position.x - ball.position.x ) <= 2 )
			{	
				//TODO: bounce direction based on paddle collision location
				xDir = -xDir;
				two.play();
			}
			else
			{
				ball.position.x = ball.position.y = 0;
				explode.play();
			}
		}
		
		//paddle1.position.x = ball.position.x;
		// "AI" movement -- TODO: Improve AI
		if(ball.position.x < paddle1.position.x)
		{
			paddle1.position.x -= accelFactor*0.02
		}
		else if (ball.position.x > paddle1.position.x)
		{
			 paddle1.position.x += accelFactor*0.02;
		}

	}

	//Keep score
	function updateScore()
	{	
		if( playerScoreObject != null)
		{
			scene.remove( playerScoreObject );
			
		}
		if(computerScoreObject != null)
		{
			scene.remove( computerScoreObject );
		}

		var playerScoreString = "" + playerScoreValue;
		var computerScoreString = "" + computerScoreValue;

		//let scoreParams = 

		//Create score object geometry
		var playerScoreObjectGeometry = new THREE.TextGeometry(playerScoreString, {
			size: 2,
			height: 0.4,
			curveSegments: 10,
			bevelEnabled: false
		});
		var computerScoreObjectGeometry = new THREE.TextGeometry(computerScoreString, {
			size: 2,
			height: 0.4,
			curveSegments: 10,
			bevelEnabled: false
		});

		//Create score object materials
		var playerScoreObjectMaterial = new THREE.MeshLambertMaterial({color:'purple'});
		var computerScoreObjectMaterial = new THREE.MeshLambertMaterial({color:'cyan'});

		//Create score objects
		playerScoreObject = new THREE.Mesh(playerScoreObjectGeometry, playerScoreObjectMaterial);
		computerScoreObject = new THREE.Mesh(computerScoreObjectGeometry, computerScoreObjectMaterial);

		playerScoreObject.position.x = -10;
		playerScoreObject.position.y = 10;
		playerScoreObject.position.z = 2;
		
		computerScoreObject.position.x = 10;
		computerScoreObject.position.y = 10
		computerScoreObject.position.z = 2;

		scene.add(playerScoreObject);
		scene.add(computerScoreObject);

	}

	///Load game sounds
	function loadSounds()
	{
		explode = new Audio("sounds/Explosion.mp3");
		one = new Audio("sounds/1.mp3");
		two = new Audio("sounds/2.mp3");
		three = new Audio("sounds/3.mp3");
		four = new Audio("sounds/4.mp3");
		five = new Audio("sounds/5.mp3");
	}

	///Set game speed
	function setAccelSlow()
	{
		accelFactor = 1;
	}

	function setAccelNormal()
	{
		accelFactor = 2;
	}

	function setAccelFast()
	{
		accelFactor = 3;
	}


	

