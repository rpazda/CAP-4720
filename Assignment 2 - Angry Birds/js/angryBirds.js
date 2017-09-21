	
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

	jjiFor an example of an A project, go to the link at http://rickleinecker.com/project1/

		Going past a quiz a grade of C, you can add any combination of the following (you don't need them all to get 100):
		1. Objects that move in front of the target that the projectile might hit
		2. Music
		3. Changing projectiles and a selector
		4. Catapult instead of a cannon
		5. Changeable perspective, favoring perspective from the cannon/catapult.
		6. Particle effects
		7. Exploding projectile in certain circumstances.
	*/
	
	var renderer;
	var scene;
	var camera;
	
	function init()
	{
		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(
		// frustum vertical view         aspect ratio							 frustum near plane     frustum far plane
			45,                          window.innerWidth / window.innerHeight, 0.1,                   1000 );

		setupRenderer();
		setupCamera();
		
		// Main code here.



		
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
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMapEnabled = true;
	}
	
	function setupCamera()
	{
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 13;
		camera.lookAt( scene.position );
	}
	
	function render()
	{
		// Request animation frame
		requestAnimationFrame( render );
		
		// Call render()
		renderer.render( scene, camera );
	}
	
	window.onload = init;

