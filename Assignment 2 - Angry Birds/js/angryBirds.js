	
	/*
	For a grade of C, you need the following:
		--1. a textured plane upon which the objects are placed and move
		--2. an object that fires projectiles
		--3. A Physijs compliant physics-based 3D world
		--4. Sounds and optional music
		--5. At least four different targets, which are made up of independent objects.
		--6. An object in the target, that when it hits the ground plane, will add to the score
		--7. 3D text
		--8. Score
		--9. Simple help for play keys
		--10. Your name somewhere in the game
		--11. Use of the factory pattern for creating targets (do the best you can for javascript)

	For an example of an A project, go to the link at http://rickleinecker.com/project1/

		Going past a grade of C, you can add any combination of the following (you don't need them all to get 100):
		1. Objects that move in front of the target that the projectile might hit	[Implemented but not working, disabled]
		--2. Music
		3. Changing projectiles and a selector	[Implementd but not working]
		4. Catapult instead of a cannon
		--5. Changeable perspective, favoring perspective from the cannon/catapult.
		6. Particle effects
		7. Exploding projectile in certain circumstances.
	*/

	/*
		Ideas:
			Planet themes with different gravity/textures

	*/
	
	var renderer;
	var scene;
	var camera;
	var spotlight;

	var defaultMusic, knock, slam, thunk, explosion;

	var gravityFactor = -30;
	var cannon, cannonBase;
	var ball;
	var shotcount = 10;
	var targets = [];
	var alienShip, alienTank;
	var shipCycleUpward = true;
	var score = 0;
	var musicPlaying = true;
	
	Physijs.scripts.worker = 'libs/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';
	
	function beginGame()
	{
		init();
	}

	$(document).ready(function() {
		$('select').material_select();
	});

	function init(planet)
	{
		//scene = new THREE.Scene();
		scene = new Physijs.Scene();
		scene.setGravity(new THREE.Vector3(0, 0, gravityFactor));

		camera = new THREE.PerspectiveCamera(
		// frustum vertical view         aspect ratio							 frustum near plane     frustum far plane
			45,                          window.innerWidth / window.innerHeight, 0.1,                   1000 );

		setupRenderer();
		setupCamera();
		setupSpotlight();
		
		// Main code here.
		initGamePanel();
		loadTextures();
		loadMusic();
		loadSounds();
		createPlaySurface(planet);
		//addAlienShip();
		//addAlienTank();
		addCannon();
		createTargets();
		addProps();
		createFloatingText();
		
		// Output to the stream
		//document.body.appendChild( renderer.domElement );
		document.getElementById("game-window").appendChild( renderer.domElement);
		
		// Call render
		render();
	}
	
	function setupRenderer()
	{
		renderer = new THREE.WebGLRenderer();
		//						color     alpha
		renderer.setClearColor( 0x000000, 1.0 );
		//renderer.setSize( window.innerWidth-100, window.innerHeight-100 );
		//renderer.setSize(document.getElementById("game-window").innerWidth, document.getElementById("game-window").innerWidth * 0.75);
		renderer.setSize( window.innerWidth * 0.7, window.innerHeight * 0.7 );
		renderer.shadowMapEnabled = true;
	}
	
	function setupCamera()
	{
		camera.position.x = 0;
		camera.position.y = -150;
		camera.position.z = 150;
		camera.lookAt( scene.position );
	}
	
	//Select one of four quadrant camera or one behind the cannon
	function selectCamera(cam)
	{
		switch(cam)
		{
			case 1:
				camera.position.x = 0;
				camera.position.y = -150;
				camera.position.z = 150;
				camera.lookAt( scene.position );
				break;
			case 2:	
				camera.position.x = 150;
				camera.position.y = 0;
				camera.position.z = 150;
				camera.lookAt( scene.position );
				camera.rotation.z = Math.PI/2;
				break;
			case 3:
				camera.position.x = 0;
				camera.position.y = 150;
				camera.position.z = 150;
				camera.lookAt( scene.position );
				camera.rotation.z = Math.PI;
				break;
			case 4:
				camera.position.x = -150;
				camera.position.y = 0;
				camera.position.z = 150;
				camera.lookAt( scene.position );
				camera.rotation.z = 3*Math.PI/2;
				break;
			case 5:
				camera.position.x = -100;
				camera.position.y = 0;
				camera.position.z = 10;
				camera.lookAt( scene.position );
				camera.rotation.z = 3*Math.PI/2;
				break;
			default:
				break;
		}
	}

	//Add spotlight
	function setupSpotlight()
	{
		spotlight = new THREE.SpotLight();
		spotlight.position.set(50,50,200);
		spotlight.shadowNear = 10;
		spotlight.shadowFar = 100;
		spotlight.castShadow = true;
		spotlight.intensity = 3;
		scene.add(spotlight);
	}
	
	//Render function to update scene
	function render()
	{	
		scene.simulate();

		controlCannon();

		//moveAlienTank();

		//moveAlienShip();

		enableCannonFire();

		// Request animation frame
		requestAnimationFrame( render );
		
		// Call render()
		renderer.render( scene, camera );
	}

	function loadTextures()
	{
		
	}

	function loadSounds()
	{
		knock = new Audio("sounds/knock.mp3");
		slam = new Audio("sounds/slam.mp3");
		thunk = new Audio("sounds/thunk.mp3");
		explosion = new Audio("sounds/explosion.mp3");
	}

	function loadMusic() 
	{
		defaultMusic = new Audio("sounds/default.mp3");
		defaultMusic.play();
		defaultMusic.loop = true;

	}

	///Initial maind HUD
	function initGamePanel()
	{
		$("#cannon-status").html("<span style='color:#7df442'>Armed</span>");
		$("#score-display").html(0); 
		$("#shot-counter").html(shotcount);
	}

	///Cannon HUD update functions
	function displayCannonArmed()
	{
		$("#cannon-status").html("<span style='color:#7df442'>Armed</span>");
	}
	function displayCannonReloading()
	{
		$("#cannon-status").html("<span style='color:#f28841'>Reloading</span>");
	}
	//Display game over and score at end of game
	function displayCannonDepleted()
	{
		$("#cannon-status").html("<span style='color:#e50d0d'>Depleted</span>");
		$("#game-window").html("<center><h1><span class='red-text'>Game Over!</span></h1><center>");
		if(score > 0)
		{
			$("#game-window").append("<center><h2><span class='red-text'>Score: "+score+",000,000</span></h><center>");
			$("#game-window").append("<center><button class='btn' onClick='window.location.reload()'>Play Again</button><center>");
		}
		else
		{
			$("#game-window").append("<center><h2><span class='red-text'>No targets destroyed.</span></h><center> <center><h2><span class='red-text'>Please try again.</span></h><center>");
			$("#game-window").append("<center><button class='btn' onClick='window.location.reload()'>Play Again</button><center>");

		}
		
	}

	///Update level based on dropdown, called from UI
	function changeLevel()
	{	
		let planet = $("#level-select").val();

		switch($("#level-select").val())
		{
			case 1:
				gravityFactor = -30;
				init(planet);
				break;
			case 2:
				gravityFactor = (-30) * 0.38;
				init(planet);
				break;
			case 3:
				gravityFactor = (-30) * 1.12;
				init(planet);
				break;
			default:
				break;
		}
	}

	///Turn music on/off
	function toggleMusic(){
		if(musicPlaying == false)
		{
			$('#music-toggle').html("Music Off");
			defaultMusic.play();
			musicPlaying = true;
		}
		else
		{	
			defaultMusic.pause();
			$('#music-toggle').html("Music On");
			musicPlaying = false;
		}
	}

	///Change play surface based on dropdown, called from init()
	function createPlaySurface(planet)
	{		
		/*
			var moonSurface = THREE.ImageUtils.loadTexture('assets/as08-12-2193~orig.jpg');
			var moonMaterial = new THREE.MeshLambertMaterial({map: moonSurface});
			//var moonMaterial = new THREE.MeshLambertMaterial({color: 'cyan'});
			var planeMaterial = new Physijs.createMaterial(moonMaterial, 0.4, 0.8);
		*/

		var planetSurface;
		var planetMaterial;
		var planeMaterial;

		switch(planet)
		{
			case 1:
				planetSurface = THREE.ImageUtils.loadTexture('assets/as08-12-2193~orig.jpg');
				planetMaterial = new THREE.MeshLambertMaterial({map: planetSurface});
				planeMaterial = new Physijs.createMaterial(planetMaterial, 0.4, 0.8);
				break;
			case 2:
				planetSurface = THREE.ImageUtils.loadTexture('assets/PIA10792~orig.jpg');
				planetMaterial = new THREE.MeshLambertMaterial({map: planetSurface});
				planeMaterial = new Physijs.createMaterial(planetMaterial, 0.4, 0.8);
				break;
			case 3:
				planetSurface = THREE.ImageUtils.loadTexture('assets/PIA00052~orig.jpg');
				planetMaterial = new THREE.MeshLambertMaterial({map: planetSurface});
				planeMaterial = new Physijs.createMaterial(planetMaterial, 0.4, 0.8);
				break;
			default:
				break;
		}

		var planeGeometry = new THREE.PlaneGeometry(250, 250, 6);
		var groundPlane = new Physijs.BoxMesh(planeGeometry, planeMaterial, 0);
		groundPlane.name = "GroundPlane";
		scene.add(groundPlane);
	}
	
	///Create cannon and add to scene
	function addCannon()
	{	
		var cannonGeometry = new THREE.CylinderGeometry(2,2,10);
		var cannonTexture = THREE.ImageUtils.loadTexture('assets/cannonMap.png');
		var cannonMaterial = new THREE.MeshLambertMaterial({map: cannonTexture});

		cannonBase = new THREE.Mesh(cannonGeometry, cannonMaterial);
		cannonBase.position.y = -5;
		scene.add(cannonBase);

		cannon = new THREE.Object3D();
		cannon.add(cannonBase);
		cannon.rotation.z = Math.PI/2;
		cannon.position.x -= 84;
		cannon.position.z += 5;
		cannon.name = "Cannon";

		scene.add(cannon);
	}

	///Create and add moving alien ship
	function addAlienShip()
	{
		var alienShipGeometry = new THREE.TorusGeometry(5,2,16,100);
		var alienShipMaterial = new THREE.MeshLambertMaterial({color:'#a8daed'});
		alienShip = new Physijs.ConvexMesh(alienShipGeometry, alienShipMaterial);

		alienShip.position.x = 0;
		alienShip.position.y = 0;
		alienShip.position.z = 5;
		//alienShip.applyCentralImpulse(new THREE.Vector3( 0,0,30));

		scene.add(alienShip);
	}

	///Create and add moving alien tank
	function addAlienTank()
	{
		var alienTankGeometry = new THREE.BoxGeometry(2,2,3);
		var alienTankMaterial = new THREE.MeshLambertMaterial({color: 'green'});
		alienTank = new Physijs.BoxMesh(alienTankGeometry, alienTankMaterial);

		alienTank.position.z = 5;

		scene.add(alienTank);
	}

	///Control motion of alien ship by updating position within bounds
	function moveAlienShip()
	{	
		alienShip.position.x = 0;
		alienShip.position.z = 5;
		
		if(alienShip.position.y > 100)
		{
			shipCycleUpward = false;
		}
		else if(alienShip.position.y < -100)
		{
			shipCycleUpward = true;
		}
		if(shipCycleUpward == true)
		{
			alienShip.position.y += 0.5;
		}
		else if(shipCycleUpward == false)
		{
			alienShip.position.y -= 0.5;
		}
	}

	///Control motion of alien tank by updating postition within bounds
	function moveAlienTank()
	{
		alienTank.position.x = 0;
		alienTank.position.z = 5;
		
		if(alienTank.position.y > 100)
		{
			shipCycleUpward = false;
		}
		else if(alienTank.position.y < -100)
		{
			shipCycleUpward = true;
		}
		if(shipCycleUpward == true)
		{
			alienTank.position.y += 0.5;
		}
		else if(shipCycleUpward == false)
		{
			alienTank.position.y -= 0.5;
		}
	}

	///Add non-funtional game details
	function addProps()
	{
		addCommandCenter(-80, 60);
		addCommandCenter(-80, -60);
	}

	///Generic function for creating command center decorative elements
	function addCommandCenter(xpos, ypos)
	{
		var commandCenterGeometry = new THREE.BoxGeometry(8,8,8);
		var commandCenterMaterial = THREE.ImageUtils.loadTexture('assets/commandCenterMap.png');
		var commandCenterMaterial = new THREE.MeshLambertMaterial({map: commandCenterMaterial});

		var commandCenter = new THREE.Mesh(commandCenterGeometry, commandCenterMaterial);
		commandCenter.position.x = xpos;
		commandCenter.position.y = ypos;

		scene.add(commandCenter);
	}

	///Manipulate cannon aim using key commands
	function controlCannon()
	{
		if(Key.isDown(Key.A))
		{
			cannon.rotation.y -=0.01;
			if(cannonBase.rotation.y < -(Math.PI /3))
			{
				cannonBase.rotation.y = -(Math.PI / 3);
			}
		}
		if(Key.isDown(Key.D))
		{
			cannon.rotation.y +=0.01;
			if(cannonBase.rotation.y > 0)
			{
				cannonBase.rotation.y = 0;
			}
		}
		if(Key.isDown(Key.W))
		{
			cannon.rotation.z += 0.01;
		}
		if(Key.isDown(Key.S))
		{
			cannon.rotation.z -=0.01;
		}
	}

	var ballLaunched = false;

	///Control cannon firing using key commands
	function enableCannonFire()
	{
		if(!ballLaunched && Key.isDown(Key.F) && shotcount > 0)
		{	
			//Update shot count HUD
			shotcount--;
			$("#shot-counter").html(shotcount);
			if(shotcount >= 1)
			{
				displayCannonReloading();
			}
			else{
				displayCannonDepleted();
			}
			createBall();
			ballLaunched = true;
			scene.add(ball);
			
			//Given formula did not work too well with my code but the version below I worked on with a friend doesn't work with my code any better
			ball.applyCentralImpulse( new THREE.Vector3( 8000, (-(Math.PI / 2 - cannon.rotation.z) * 4000) % 4000, -cannon.rotation.y * 10000) );

			/*
			var ballVelocity = 6000;

			var xFactor = Math.cos(cannon.rotation.z - Math.PI/2) * Math.cos(cannonBase.rotation.x) * ballVelocity;
			var yFactor = Math.sin(cannon.rotation.z - Math.PI/2) * Math.cos(cannonBase.rotation.x) * ballVelocity;
			var zFactor = -Math.sin(cannonBase.rotation.x) * ballVelocity;

			ball.applyCentralImpulse(new THREE.Vector3(xFactor, yFactor, zFactor));
			*/
		}
		if(ballLaunched && Key.isDown(Key.Q) )
		{	
			if(shotcount > 0)
			{
				displayCannonArmed();
			}
			ballLaunched = false;
			scene.remove(ball);
		}
	}

	///Create and manage ball, including collisions
	function createBall()
	{
		var ballGeometry = new THREE.SphereGeometry(2.5);
		var ballMaterialBase = new THREE.MeshLambertMaterial({color:'cyan'}, 0.95, 0.95);
		var ballMaterial = Physijs.createMaterial(ballMaterialBase);
		ball = new Physijs.SphereMesh(ballGeometry, ballMaterial);

		ball.position.x = cannon.position.x + Math.cos((Math.PI/2) - cannon.rotation.z) * 10;
		ball.position.y = cannon.position.y - Math.cos(cannon.rotation.z) * 10;
		ball.position.z = cannon.position.z - Math.sin(cannon.rotation.y) * 10;

		ball.position.x = cannon.position.x;
		ball.position.y = cannon.position.y;
		ball.position.z = cannon.position.z;
		ball.name = "CannonBall";

		ball.addEventListener( 'collision', function(other_object, linear_velocity, angular_velocity)
		{	
			knock.play();
			if( other_object.name == "TargetBall")
			{	
				thunk.play();
				explosion.play();
				//score++;
				//updateScoreDisplay();
			}
			if( other_object.name == "GroundPlane")
			{
				knock.play();
			}
			if( other_object.name == "Tower")
			{
				knock.play();
			}
		});
	}

	///Update score in HUD
	function updateScoreDisplay()
	{
		$("#score-display").html(score);
	}

	///Create all targets on field
	function createTargets()
	{
		createQuadTarget(80,80);
		createQuadTarget(80,0);
		createQuadTarget(80,-80);
		createQuadTarget(50,40);
		createQuadTarget(50,-40);
		createQuadTarget(0, -50);
		createQuadTarget(0, 50);
		createQuadTarget(25, 70);
		createQuadTarget(25, -70);
	}

	///Abstracted target creation, accepts (x,y) tuple, creates four towers that hold up a target sphere
	function createQuadTarget(xpos, ypos)
	{
		var tempGeometry = new THREE.BoxGeometry(4,4,12);
		var tempMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 'cyan'}), 0.95, 0.95);
		//var tempMesh = new Physijs.BoxMesh(tempGeometry, tempMaterial);

		var tower1 = new Physijs.BoxMesh(tempGeometry, tempMaterial);
		var tower2 = new Physijs.BoxMesh(tempGeometry, tempMaterial);
		var tower3 = new Physijs.BoxMesh(tempGeometry, tempMaterial);
		var tower4 = new Physijs.BoxMesh(tempGeometry, tempMaterial);

		var targetGeometry = new THREE.SphereGeometry(5);
		var targetMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color: 'purple'}), 0.95, 0.95);
		var targetMesh = new Physijs.SphereMesh(targetGeometry, targetMaterial);

		tower1.position.x = xpos + 5;
		tower1.position.y = ypos;
		tower1.position.z = 6;

		tower2.position.x = xpos;
		tower2.position.y = ypos - 5;
		tower2.position.z = 6;

		tower3.position.x = xpos;
		tower3.position.y = ypos + 5;
		tower3.position.z = 6;

		tower4.position.x = xpos - 5;
		tower4.position.y = ypos;
		tower4.position.z = 6;

		targetMesh.position.x = xpos;
		targetMesh.position.y = ypos;
		targetMesh.position.z = 16;

		tower1.name = "Tower";
		tower2.name = "Tower";
		tower3.name = "Tower";
		tower4.name = "Tower";
		targetMesh.name = "TargetBall";

		targetMesh.addEventListener( 'collision', function(other_object, linear_velocity, angular_velocity)
		{
			if( other_object.name == "GroundPlane")
			{
				slam.play();
				score++;
				updateScoreDisplay();
			}
			
		});

		scene.add(tower1);
		scene.add(tower2);
		scene.add(tower3);
		scene.add(tower4);
		scene.add(targetMesh);

	}


	///Adds motivational 3D text
	function createFloatingText(){
		var textString = "Destroy the alien artifacts!";

		var textObjectGeometry = new THREE.TextGeometry(textString, {
			size: 8.5,
			height: 3,
			curveSegments: 10,
			bevelEnabled: false
		});

		var textObjectMaterial = new THREE.MeshLambertMaterial({color:'rgb(0, 255, 180)'});

		textObject = new THREE.Mesh( textObjectGeometry, textObjectMaterial);

		textObject.position.x = -80;
		textObject.position.y = -85;
		textObject.position.z = 3;
		//textObject.rotation.x = Math.PI/2;

		scene.add(textObject);
	}
	
	window.onload = init(1);

