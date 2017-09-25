	//var $ = jQuery.noConflict();
	
	//Basic components
	var renderer;
	var scene;
	var camera;
	var spotlight;

	//Gameplay components
	var ball;
	var paddle1, paddle2;
	var playerScore, computerScore;
	var playerScoreValue = 0;
	var computerScoreValue = 0;
	var playerScoreObject, computerScoreObject;
	var explode, one, two, three, four, five;
	var colors = ['red','yellow','blue','purple','green','orange'];
	var spectators = [];

	//Higher-level gameplay modifiers
	var humanSpeedFactor = 0.04;		//Determine human movement speed limit
	var computerSpeedFactor = 0.014;		//Determines computer movement speed limit, also difficulty technically (basically unbeatable above about 0.017)
	var accelFactor = 2;				//Determines total game speed, including ball, paddles etc.

	//Bool for game state
	var gameStarted = 0;


	//Logic for Start/Stop button
	function startGame()
	{	
		init();
		
		if (gameStarted = 0)
		{
			gameStarted = 1;
			//$("#startStopButton").html("End Game");
			init();
		}
		else
		{
			gameStarted = 0;
			//$("#startStopButton").html("Start Game");
			//scene = new THREE.Scene();
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
		createCrowd();
		setInitialCrowdPositions();
		bobSpectators();
		updateScore();
		
		// Output to the stream
		document.body.appendChild( renderer.domElement );
		
		// Call render
		render();
	}

	function render()
	{
		moveBallAndMaintainPaddles();

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
		renderer.setSize( window.innerWidth-20, window.innerHeight-45 );
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
		spotLight.position.set(10,20,30);
		spotLight.shadowNnear = 20;
		spotLight.shadowFar = 70;
		spotLight.castShadow = true;
		scene.add(spotLight);
	}

	function createPlayBottom()
	{	
		//Basic playing surface
		var planeGeomtry = new THREE.PlaneGeometry(10,18,10,10);
		var planeMaterial = new THREE.MeshBasicMaterial({color: 'green'});
		var plane = new THREE.Mesh(planeGeomtry, planeMaterial);
		plane.overdraw = true;

		//Set court marking materials
		var lineMaterial = new THREE.MeshBasicMaterial({color: 'white'});
		var netMaterial = new THREE.MeshBasicMaterial({color: 'grey'});

		//Net line
		var netLineGeometry = new THREE.BoxGeometry(10,0.3,0.2);
		var netLine = new THREE.Mesh(netLineGeometry, netMaterial);
		netLine.position.x = 0;
		scene.add(netLine);

		//Baselines
		var baselineGeometry = new THREE.BoxGeometry(10,0.3,0.2);
		var playerBaseline = new THREE.Mesh(baselineGeometry, lineMaterial);
		var computerBaseLine = new THREE.Mesh(baselineGeometry, lineMaterial);
		playerBaseline.position.y = -9;
		computerBaseLine.position.y = 9;
		scene.add(playerBaseline);
		scene.add(computerBaseLine);

		//Sidelines
		var sidelineGeometry = new THREE.BoxGeometry(0.3,18,0.2);
		var leftSideline = new THREE.Mesh(sidelineGeometry,lineMaterial);
		var rightSideline = new THREE.Mesh(sidelineGeometry,lineMaterial);
		leftSideline.position.x = -3;
		rightSideline.position.x = 3;
		scene.add(leftSideline);
		scene.add(rightSideline);

		//Service lines
		var serviceLineGeometry = new THREE.BoxGeometry(6,0.3,0.2);
		var playerServiceLine = new THREE.Mesh(serviceLineGeometry, lineMaterial);
		var computerServiceLine = new THREE.Mesh(serviceLineGeometry,lineMaterial);
		playerServiceLine.position.y = -4.5;
		computerServiceLine.position.y = 4.5;
		scene.add(playerServiceLine);
		scene.add(computerServiceLine);

		//Center line
		var centerServiceLineGeometry = new THREE.BoxGeometry(0.3,9,0.2);
		var centerServiceLine = new THREE.Mesh(centerServiceLineGeometry, lineMaterial);
		centerServiceLine.position.x = 0;
		scene.add(centerServiceLine);

		//Center marks
		var centerMarkGeometry = new THREE.BoxGeometry(0.3, 1, 0.2);
		var playerCenterMark = new THREE.Mesh(centerMarkGeometry, lineMaterial);
		var computerCenterMark = new THREE.Mesh(centerMarkGeometry, lineMaterial);
		playerCenterMark.position.y = -8.5;
		computerCenterMark.position.y = 8.5;
		scene.add(playerCenterMark);
		scene.add(computerCenterMark);
		
		//Audience areas
		var audienceStandsGeometry = new THREE.BoxGeometry(3,18,0.2);
		var audienceLeftSide = new THREE.Mesh(audienceStandsGeometry, netMaterial);
		var audienceRightSide = new THREE.Mesh(audienceStandsGeometry, netMaterial);
		audienceLeftSide.position.x = -6;
		audienceLeftSide.position.z = -0.5
		audienceRightSide.position.x = 6;
		audienceRightSide.position.z = -0.5;
		scene.add(audienceLeftSide);
		scene.add(audienceRightSide);

		scene.add(plane);
	}

	function createBoundingWalls()
	{	
		var wallMaterial = new THREE.MeshBasicMaterial({color: 'white'});

		var leftWall = new THREE.BoxGeometry(0.5,18,5);
		var wall1 = new THREE.Mesh(leftWall, wallMaterial);
		wall1.position.x = -5;
		scene.add(wall1);

		var edges1 = new THREE.EdgesHelper(wall1, 0x555555);
		scene.add(edges1);

		var rightWall = new THREE.BoxGeometry(0.5,18,5);
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

		//Paddles with player colors
		var playerPaddleMaterial = new THREE.MeshBasicMaterial({color: 'rgb(221, 30, 255)'});
		var computerPaddleMaterial = new THREE.MeshBasicMaterial({color: 'rgb(0, 255, 180)'});

		paddle1 = new THREE.Mesh(opponentPaddle, computerPaddleMaterial);
		paddle2 = new THREE.Mesh(playerPaddle, playerPaddleMaterial);

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

	//Create crowd of random-colored spectators
	function createCrowd()
	{	
		var spectatorGeometry = new THREE.BoxGeometry(0.5,0.5,1);

		for (i = 0; i<100; i++)
		{
			let spectatorMaterial = new THREE.MeshLambertMaterial({color: colors[Math.floor((Math.random()*6))]});
			let newSpectator = new THREE.Mesh(spectatorGeometry, spectatorMaterial);

			//Random x,y and side
			newSpectator.position.x = (Math.random()+6)*(Math.random() < 0.5 ? -1 : 1);
			newSpectator.position.y = (Math.random()*9)*(Math.random() < 0.5 ? -1 : 1);

			//Save to array for bobbing effect
			spectators[i] = newSpectator;

			scene.add(newSpectator);
		}
	}

	//Give spectators random height (0 or 1) for variety
	function setInitialCrowdPositions()
	{
		for(i=0; i<100; i++){
			spectators[i].position.z = (Math.random() < 0.5 ? 0 : 1);
		}
	}

	//Bob spectators every second
	function bobSpectators()
	{
		for(i=0; i<100; i++){
			if (spectators[i].position.z == 0)
			{
				spectators[i].position.z = 1;
			}
			else
			{
				spectators[i].position.z = 0;
			}
		}
		var t = setTimeout(bobSpectators, 1000);
	}

	//Random initial serve direction
	var xDir = (Math.random()*0.4)+0.2 * (Math.random() < 0.5 ? -1 : 1);
	var yDir = (Math.random()*0.4)+0.2 * (Math.random() < 0.5 ? -1 : 1);

	//console.log(xDir);
	//console.log(yDir);

	function moveBallAndMaintainPaddles()
	{
		ball.position.x += xDir;
		ball.position.y += yDir;

		//Move player paddle left for 'Left arrow' key press
		if(Key.isDown(Key.LEFTARROW))
		{
			paddle2.position.x -= accelFactor*humanSpeedFactor;
		}
		//Move player paddle right for 'Right arrow' key press
		else if(Key.isDown(Key.RIGHTARROW))
		{
			paddle2.position.x += accelFactor*humanSpeedFactor;
		}
		
		//Left wall collision
		if(ball.position.x < -4.25 )//&& Math.abs(xDir) > 1)
		{
			xDir = accelFactor*(0.02);
			three.play();
		}
		//Right wall collision
		else if(ball.position.x > 4.25 )//&& Math.abs(xDir) < 1)
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
				//Deflection based on paddle collision location
				xDir = -( paddle2.position.x - ball.position.x ) * (0.08);
				one.play();
			}
			else
			{	//Computer scores
				ball.position.x = ball.position.y = 0;
				computerScoreValue++;
				updateScore();
				boo.play();
			}
		}

		//Detect paddle collision Computer side
		else if( ball.position.y > 8.5 && yDir > 0 )
		{
			yDir = accelFactor*(-0.04);
			
			if( Math.abs( paddle1.position.x - ball.position.x ) <= 2 )
			{	
				//Random deflection based for more interesting gameplay
				xDir = ((Math.random() * 0.04) + 0.02) * (Math.random() < 0.5 ? -1 : 1);
				two.play();
			}
			else
			{	//Player scores
				ball.position.x = ball.position.y = 0;
				playerScoreValue++;
				updateScore();
				cheering.play();
			}
		}

		// "AI" movement -- TODO: Improve AI
		//Computer tries to follow ball at given speed
		if(ball.position.x < paddle1.position.x)
		{
			paddle1.position.x -= accelFactor*computerSpeedFactor;
		}
		else if (ball.position.x > paddle1.position.x)
		{
			 paddle1.position.x += accelFactor*computerSpeedFactor;
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

		var playerScoreString = "You: " + playerScoreValue;
		var computerScoreString = "CPU: " + computerScoreValue;

		//Create score object geometry for both player and CPU scores
		var playerScoreObjectGeometry = new THREE.TextGeometry(playerScoreString, {
			size: 2,
			height: 0.5,
			curveSegments: 10,
			bevelEnabled: false
		});
		var computerScoreObjectGeometry = new THREE.TextGeometry(computerScoreString, {
			size: 2,
			height: 0.5,
			curveSegments: 10,
			bevelEnabled: false
		});

		//Create score object materials
		var playerScoreObjectMaterial = new THREE.MeshLambertMaterial({color:'rgb(221, 30, 255)'});
		var computerScoreObjectMaterial = new THREE.MeshLambertMaterial({color:'rgb(0, 255, 180)'});

		//Create score objects
		playerScoreObject = new THREE.Mesh(playerScoreObjectGeometry, playerScoreObjectMaterial);
		computerScoreObject = new THREE.Mesh(computerScoreObjectGeometry, computerScoreObjectMaterial);

		//Player score in upper left
		playerScoreObject.position.x = -10;
		playerScoreObject.position.y = 10;
		playerScoreObject.position.z = 2;
		
		//Computer score in upper right
		computerScoreObject.position.x = 2;
		computerScoreObject.position.y = 10
		computerScoreObject.position.z = 2;
		
		//Add scores to scene
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
		cheering = new Audio("sounds/cheering.mp3");
		boo = new Audio("sounds/boo.mp3");

		defaultMusic = new Audio("sounds/default.mp3");
		defaultMusic.play();
		defaultMusic.loop = true;

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


	

