	
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
				
	*/

	/* 
		TODO:
			Game ended condition
	*/
	
	var renderer;
	var scene;
	var camera;
	var spotlight;

	var mouse = new THREE.Vector2();
	var selectedobject = null;
	
	var raycaster = new THREE.Raycaster();
	var projector = new THREE.Projector();

	var defaultMusic;

	var musicPlaying = true;
	var soundEnabled = true;
	var gamePaused = false;
	var gameEnded = false;
	
	Physijs.scripts.worker = 'libs/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';
	
	function beginGame()
	{
		init();
	}

	$(document).ready(function() {

	});

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

		loadZune();
		
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
		camera.position.x = 100;
		camera.position.y = 100;
		camera.position.z = 100;
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

	}

	///Load player pieces
	function loadPlayerPieces()
	{

	}

	function loadZune( )
	{
		// instantiate a loader
		var loader = new THREE.OBJMTLLoader();
		
		// load an obj / mtl resource pair
		loader.load(
			// OBJ resource URL
			'assets/zune_120_obj/zune_120.obj',

			// MTL resource URL	
			'assets/zune_120_obj/rook.mtl',
			
			// Function when both resources are loaded			// Function when both resources are loaded
			function ( object ) 
			{
				// Added to fix raycasting
				object.castShadow = true;
				object.receiveShadow = true;
				object.scale.set( .3, .3, .3 );
				
				var obj = new THREE.Object3D();
				obj.name = 'Zune';
				object.parent = obj;
				obj.add( object );

				scene.add(obj);

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