	
	/*
	
	*/

	/*
		Ideas:
			

	*/
	
	var renderer;
	var scene;
	var camera;
	var spotlight;

	var defaultMusic;

	var musicPlaying = true;
	
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
		camera.position.y = 0;
		camera.position.z = 0;
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

