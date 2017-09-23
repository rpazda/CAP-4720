	
	/*
	For a grade of C, you need the following:
		1. a textured plane upon which the objects are placed and move
		2. an object that fires projectiles
		3. A Physijs compliant physics-based 3D world
		4. Sounds and optional music
		5. At least four different targets, which are made up of independent objects.
		6. An object in the target, that when it hits the ground plane, will add to the score
		7. 3D text
		8. Score
		9. Simple help for play keys
		10. Your name somewhere in the game
		11. Use of the factory pattern for creating targets (do the best you can for javascript)

	iFor an example of an A project, go to the link at http://rickleinecker.com/project1/

		Going past a quiz a grade of C, you can add any combination of the following (you don't need them all to get 100):
		1. Objects that move in front of the target that the projectile might hit
		2. Music
		3. Changing projectiles and a selector
		4. Catapult instead of a cannon
		5. Changeable perspective, favoring perspective from the cannon/catapult.
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

	var cannon;
	var ball;
	
	Physijs.scripts.worker = 'libs/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';
	
	function init()
	{
		//scene = new THREE.Scene();
		scene = new Physijs.Scene();
		scene.setGravity(new THREE.Vector3(0, 0, -30));

		camera = new THREE.PerspectiveCamera(
		// frustum vertical view         aspect ratio							 frustum near plane     frustum far plane
			45,                          window.innerWidth / window.innerHeight, 0.1,                   1000 );

		setupRenderer();
		setupCamera();
		setupSpotlight();
		
		// Main code here.
		loadTextures();
		createPlaySurface();
		addCannon();
		createTargets();
		
		// Output to the stream
		document.body.appendChild( renderer.domElement );
		
		// Call render
		render();
	}
	
	function setupRenderer()
	{
		renderer = new THREE.WebGLRenderer();
		//						color     alpha
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth-20, window.innerHeight-20 );
		renderer.shadowMapEnabled = true;
	}
	
	function setupCamera()
	{
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 200;
		camera.lookAt( scene.position );
	}

	function setupSpotlight()
	{
		spotlight = new THREE.SpotLight();
		spotlight.position.set(0,0,200);
		spotlight.shadowNear = 10;
		spotlight.shadowFar = 100;
		spotlight.castShadow = true;
		spotlight.intensity = 3;
		scene.add(spotlight);
	}
	
	function render()
	{	
		scene.simulate();

		controlCannon();

		enableCannonFire();

		// Request animation frame
		requestAnimationFrame( render );
		
		// Call render()
		renderer.render( scene, camera );
	}

	function loadTextures()
	{
		
	}

	function createPlaySurface()
	{	
		var moonSurface = THREE.ImageUtils.loadTexture('assets/as08-12-2193~orig.jpg');
		var moonMaterial = new THREE.MeshLambertMaterial({map: moonSurface});
		//var moonMaterial = new THREE.MeshLambertMaterial({color: 'cyan'});
		var planeMaterial = new Physijs.createMaterial(moonMaterial, 0.4, 0.8);

		var planeGeometry = new THREE.PlaneGeometry(250, 250, 6);
		var groundPlane = new Physijs.BoxMesh(planeGeometry, planeMaterial, 0);
		groundPlane.name = "GroundPlane";
		scene.add(groundPlane);
	}

	function addCannon()
	{	
		var cannonGeometry = new THREE.CylinderGeometry(2,2,10);
		var cannonTexture = THREE.ImageUtils.loadTexture('assets/cannonMap.png');
		var cannonMaterial = new THREE.MeshLambertMaterial({map: cannonTexture});

		var cannonBase = new THREE.Mesh(cannonGeometry, cannonMaterial);
		cannonBase.position.y = -5;
		scene.add(cannonBase);

		cannon = new THREE.Object3D();
		cannon.add(cannonBase);
		cannon.rotation.z = Math.PI/2;
		cannon.position.x -= 84;
		cannon.position.z += 20;
		cannon.name = "Cannon";

		scene.add(cannon);
	}

	function controlCannon()
	{
		if(Key.isDown(Key.A))
		{
			cannon.rotation.y -=0.01;
			if(cannon.rotation.y < -(Math.PI /3))
			{
				cannon.rotation.y = -(Math.PI / 3);
			}
		}
		if(Key.isDown(Key.D))
		{
			cannon.rotation.y +=0.01;
			if(cannon.rotation.y > 0)
			{
				cannon.rotation.y = 0;
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
	function enableCannonFire()
	{
		if(!ballLaunched && Key.isDown(Key.F))
		{
			createBall();
			ballLaunched = true;
			scene.add(ball);
			ball.applyCentralImpulse( new THREE.Vector3( 8000, (-(Math.PI / 2 - cannon.rotation.z) * 4000) % 4000, -cannon.rotation.y * 10000) );
		}
		if(ballLaunched && Key.isDown(Key.Q))
		{
			ballLaunched = false;
			scene.remove(ball);
		}
	}

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

		//scene.add(ball);
	}

	function createTargets()
	{

	}
	
	window.onload = init;

