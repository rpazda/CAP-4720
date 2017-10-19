	
	/*
		Create a board game. 
		It must load in object models. 
		It must use raycasting to detect what piece the mouse clicked on.

		sound effects 
		music.
	*/

	/*
		Ideas:
			Arbitrarium

				Game of chance with known and unknown probability elements
				Square board with movement based on "dice roll"
				Point deductions for not completing turn in time
				Mystery squares
				5x5 grid of squares, 16 spaces
				2 players, -80y offset inside space
	*/

	/* 
		TODO:
			Game ended condition
	*/
	
	var renderer;
	var scene;
	var camera;
	var spotlight;

	var playerGamePiece = new THREE.Object3D();
	var computerGamePiece = new THREE.Object3D();

	var mouse = new THREE.Vector2();
	var selectedobject = null;
	
	var raycaster = new THREE.Raycaster();
	var projector = new THREE.Projector();

	var defaultMusic;

	var musicPlaying = true;
	var soundEnabled = true;
	var gamePaused = false;
	var gameEnded = false;

	var spaceSize = 160;	//Size of board spaces
	var playerOffsetY = -40;//X offset so pieces don't collide
	var computerOffsetY = 40;
	var turnTime = 30;		//Time in seconds for players to complete turn

	//Mapping between spaces on board and x,y coordinates
	var boardSpacesX = [-2*spaceSize, -spaceSize, 0, spaceSize, 2*spaceSize, 2*spaceSize, 2*spaceSize, 2*spaceSize, 2*spaceSize, spaceSize, 0, -spaceSize, -2*spaceSize, -2*spaceSize, -2*spaceSize, -2*spaceSize ];
	var boardSpacesY = [2*spaceSize, 2*spaceSize, 2*spaceSize, 2*spaceSize, 2*spaceSize, spaceSize, 0, -spaceSize, -2*spaceSize, -2*spaceSize, -2*spaceSize, -2*spaceSize,-2*spaceSize, -spaceSize, 0, spaceSize ];
	
	var playerSpace = 0;
	var computerSpace = 0;

	Physijs.scripts.worker = 'libs/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';

	$(document).ready(function() {

	});

	function beginGame()
	{
		init();
		$('#begin-game-button').remove();
	}

	function init()
	{
		//scene = new THREE.Scene();
		scene = new Physijs.Scene();
		//scene.setGravity(new THREE.Vector3(0, 0, gravityFactor));

		camera = new THREE.PerspectiveCamera(
		// frustum vertical view         aspect ratio							 frustum near plane     frustum far plane
			45,                          window.innerWidth / window.innerHeight, 0.1,                   1000 );

		setupRenderer();
		setupCamera();
		setupSpotlight();
		
		// Main code here.
		//initGamePanel();
		//loadTextures();
		//loadMusic();
		//loadSounds();
		//createFloatingText();
		loadGameBoard();

		//loadZune();
		loadGamePieces();
		
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
		//camera.position.x = 100;
		//camera.position.y = -300;
		camera.position.z = 1000;
		//camera.rotation.x = Math.PI;
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

	//Create default spotlights, two in opposite corners for good coverage
    function setupSpotlight()
    {
        spotlight1 = new THREE.SpotLight();
        spotlight2 = new THREE.SpotLight();
		spotlight3 = new THREE.SpotLight();
		spotlight4 = new THREE.SpotLight();

		var intensity = 2.5;

		spotlight1.position.set(500,500,300);
		spotlight1.shadowNear = 10;
		spotlight1.shadowFar = 100;
		spotlight1.castShadow = true;
		spotlight1.intensity = intensity;

        spotlight2.position.set(-500,-500,100);
		spotlight2.shadowNear = 10;
		spotlight2.shadowFar = 100;
		spotlight2.castShadow = true;
		spotlight2.intensity = intensity;

		spotlight3.position.set(-500,500,100);
		spotlight3.shadowNear = 10;
		spotlight3.shadowFar = 100;
		spotlight3.castShadow = true;
		spotlight3.intensity = intensity;

		spotlight4.position.set(500,-500,100);
		spotlight4.shadowNear = 10;
		spotlight4.shadowFar = 100;
		spotlight4.castShadow = true;
		spotlight4.intensity = intensity;
		
        scene.add(spotlight1);
        scene.add(spotlight2);
		scene.add(spotlight3);
		scene.add(spotlight4);
    }
	
	//Render function to update scene
	function render()
	{	
		if(gamePaused == false && !gameEnded)
        {
			scene.simulate();

			// Request animation frame
			requestAnimationFrame( render );
			
			// Call render()
			renderer.render( scene, camera );
		}
	}

	function loadTextures()
	{
		
	}

	function loadSounds()
	{
		//knock = new Audio("sounds/knock.mp3");
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
		
	}

	///Load the game board
	function loadGameBoard()
	{
		// var geometry = new THREE.PlaneGeometry( 1, 1 );
		// var mesh = new THREE.Mesh( geometry, material );
		// mesh.scale.x = image.width;
		// mesh.scale.y = image.height;

		var gameBoardSurface;
        var gameBoardMaterial;
        var planeMaterial;

        gameBoardSurface = THREE.ImageUtils.loadTexture('assets/board.PNG');
        gameBoardMaterial = new THREE.MeshLambertMaterial({map: gameBoardSurface});
        //planeMaterial = new Physijs.createMaterial(gameBoardMaterial, 0.4, 0.8);

        var planeGeometry = new THREE.PlaneGeometry(1,1);
        //var playgameBoard = new Physijs.BoxMesh(planeGeometry, planeMaterial,0);
        var gameBoard = new THREE.Mesh(planeGeometry, gameBoardMaterial);
		gameBoard.position.x = 0;
		gameBoard.position.y = 0;
		gameBoard.position.z = 0;
		gameBoard.scale.x = 800;
		gameBoard.scale.y = 800;
        gameBoard.name = "GameBoard";
        scene.add(gameBoard);
	}

	///Load player pieces
	function loadPlayerPieces()
	{

	}

	///Player begins turn, timer starts
	function startTurn()
	{

	}

	///Player completes turn, timer stops. Bonus if early, penalty if late
	function completeTurn()
	{

	}

	function loadGamePieces()
	{
		// instantiate a loader
		var loader = new THREE.OBJMTLLoader();
		var loader1 = new THREE.OBJMTLLoader();
		
		// load an obj / mtl resource pair
		loader.load(
			// OBJ resource URL
			'assets/rook.obj',
			// MTL resource URL	
			'assets/rook.mtl',
			// Function when both resources are loaded
			function ( object ) 
			{
				// Added to fix raycasting
				object.castShadow = true;
				object.receiveShadow = true;
				object.scale.set(1,1,1);

				var playerGamePiece = new THREE.Object3D();
				playerGamePiece.name = 'PlayerGamePiece';
				object.parent = playerGamePiece;
				playerGamePiece.add( object );

				scene.add(playerGamePiece);

				playerGamePiece.position.x = boardSpacesX[playerSpace];
				playerGamePiece.position.y = boardSpacesY[playerSpace] + playerOffsetY;
			}
		);

		// load an obj / mtl resource pair
		loader1.load(
			// OBJ resource URL
			'assets/rook.obj',
			// MTL resource URL	
			'assets/rook.mtl',
			// Function when both resources are loaded
			function ( object ) 
			{
				// Added to fix raycasting
				object.castShadow = true;
				object.receiveShadow = true;
				object.scale.set(1,1,1);

				//var obj = new THREE.Object3D();
				computerGamePiece.name = 'ComputerGamePiece';
				object.parent = computerGamePiece;
				computerGamePiece.add( object );

				scene.add(computerGamePiece);

				computerGamePiece.position.x = boardSpacesX[computerSpace];
				computerGamePiece.position.y = boardSpacesY[computerSpace] + computerOffsetY;
			}
		);
	}

	function testMoveGamePieces()
	{
		if(playerSpace == 15){
			playerSpace = 0;
		}else{
			playerSpace++;
		}
		if(computerSpace == 15){
			computerSpace = 0;
		}else{
			computerSpace++;
		}
			

		playerGamePiece.position.x = boardSpacesX[playerSpace];
		playerGamePiece.position.y = boardSpacesY[playerSpace] + playerOffsetY;

		computerGamePiece.position.x = boardSpacesX[computerSpace];
		computerGamePiece.position.y = boardSpacesY[computerSpace] + computerOffsetY;

	}

	function loadZune( )
	{
		// instantiate a loader
		var loader = new THREE.OBJMTLLoader();
		
		// load an obj / mtl resource pair
		loader.load(
			// OBJ resource URL
			//'assets/zune_120_obj/zune_120.obj',
			'assets/rook.obj',
			// MTL resource URL	
			//'assets/zune_120_obj/rook.mtl',
			'assets/rook.mtl',
			// Function when both resources are loaded			// Function when both resources are loaded
			function ( object ) 
			{
				// Added to fix raycasting
				object.castShadow = true;
				object.receiveShadow = true;
				//object.scale.set( .3, .3, .3 );
				object.scale.set(1,1,1);

				var obj = new THREE.Object3D();
				obj.name = 'Zune';
				object.parent = obj;
				obj.add( object );

				scene.add(obj);

				obj.position.x = boardSpacesX[playerSpace] + playerOffsetX;
				obj.position.y = boardSpacesY[playerSpace];

				//obj.rotation.x = -(Math.PI/2);
			}
		);
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

	//Enable/disable sounds
	function toggleSounds(){
		if(soundEnabled == false)
		{
			$('#sounds-toggle').html("Sounds Off");
			soundEnabled = true;
		}
		else
		{	
			$('#sounds-toggle').html("Sounds On");
			soundEnabled = false;
		}
	}  

	///Toggle pause/unpause
    function pauseGame()
    {
        if(gamePaused == false)
		{
			$('#pause-button').html("Unpause Game");
			gamePaused = true;
		}
		else
		{	
			$('#pause-button').html("Pause Game");
			gamePaused = false;
		}
    }

	///Add non-funtional game details
	function addProps()
	{

	}

	///Update score in HUD
	function updateScoreDisplay()
	{
		$("#score-display").html(score);
	}

	///Adds motivational 3D text
	function createFloatingText(){
		var textString = "";

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
	
	window.onload = init();