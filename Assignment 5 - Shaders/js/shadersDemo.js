	
	/*
		1. Simple shader with pattern.
		2. Simple shader with pattern that has simple motion.
		--3. Shader for cube
		--4. Shader for sphere
	*/
	
	var renderer;
	var scene;
	var camera;
	var spotLight;

	var cube;
	var sphere;
	var simplePatternCube;
	var simpleMotionPatternCube;

	$(document).ready(function() {
		init();
	});

	function init()
	{
		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(
		// frustum vertical view         aspect ratio							 frustum near plane     frustum far plane
			45,                          window.innerWidth / window.innerHeight, 0.1,                   1500 );

		setupRenderer();
		setupCamera();
		setupSpotlight();

		createCustomShaderCube(-10, 10, "fragment", 10);
		createCustomShaderSphere(-10, -10, "sphere", 5);
		createCustomPatternCube(10, 10, "pattern", 10);
		createCustomMotionPatternCube(10, -10, "pattern-motion", 10);
		
		// Output to the stream
		//document.body.appendChild( renderer.domElement );
		document.getElementById("game-window").appendChild( renderer.domElement);
		
		// Call render
		render();
	}

	function createCustomShaderCube( Xcoord, Ycoord, shaderID, size)
	{
		var material = createCustomMaterialFromGLSLCode(shaderID);
		var geometry = new THREE.BoxGeometry(size, size, size);
		cube = new THREE.Mesh(geometry, material);
		scene.add(cube);
		cube.position.x = Xcoord;
		cube.position.y = Ycoord;
	}

	function createCustomShaderSphere(Xcoord, Ycoord, shaderID, size)
	{
		var material = createCustomMaterialFromGLSLCode(shaderID);
		var geometry = new THREE.SphereGeometry(size, 32, 32);
		sphere = new THREE.Mesh(geometry, material);
		scene.add(sphere);
		sphere.position.x = Xcoord;
		sphere.position.y = Ycoord;
	}

	function createCustomPatternCube(Xcoord, Ycoord, shaderID, size)
	{
		var material = createCustomMaterialFromGLSLCode(shaderID);
		var geometry = new THREE.BoxGeometry(size, size, size);
		simplePatternCube = new THREE.Mesh(geometry, material);
		scene.add(simplePatternCube);
		simplePatternCube.position.x = Xcoord;
		simplePatternCube.position.y = Ycoord;
	}

	function createCustomMotionPatternCube(Xcoord, Ycoord, shaderID, size)
	{	
		var material = createCustomMaterialFromGLSLCodeWithUniforms(shaderID);
		var geometry = new THREE.BoxGeometry(size, size, size);
		simpleMotionPatternCube = new THREE.Mesh(geometry, material);
		scene.add(simpleMotionPatternCube);
		simpleMotionPatternCube.position.x = Xcoord;
		simpleMotionPatternCube.position.y = Ycoord;
	}
	
	function setupRenderer()
	{
		renderer = new THREE.WebGLRenderer();
		//						color     alpha
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth * 0.7, window.innerHeight * 0.7 );
		renderer.shadowMapEnabled = true;
	}
	
	function setupCamera()
	{
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 50;
		camera.lookAt( scene.position );
	}

    //Create default spotlight
    function setupSpotlight()
    {
		var spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( 10, 20, 20 );
        spotLight.shadowCameraNear = 20;
        spotLight.shadowCameraFar = 50;
		spotLight.lookAt( new THREE.Vector3( 0, 0, 0 ) );
        scene.add( spotLight );
	}

	var intensity = 0.0, dir = 0.1;

	//Render function to update scene
	function render()
	{	
		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;
		cube.rotation.z += 0.01;

		sphere.rotation.x += 0.01;
		sphere.rotation.y += 0.01;
		sphere.rotation.z += 0.01;

		simplePatternCube.rotation.x += 0.01;
		simplePatternCube.rotation.y += 0.01;
		simplePatternCube.rotation.z += 0.01;

		simpleMotionPatternCube.rotation.x += 0.01;
		simpleMotionPatternCube.rotation.y += 0.01;
		simpleMotionPatternCube.rotation.z += 0.01;

		intensity += dir;
		if( intensity > 1.0 )
		{
			intensity = 1.0;
			dir = -dir;
		}
		else if( intensity < 0.0 )
		{
			intensity = 0.0;
			dir = -dir;
		}
		simpleMotionPatternCube.material.uniforms.ri.valueOf = intensity;
		simpleMotionPatternCube.material.uniforms.gi.valueOf = intensity;
		simpleMotionPatternCube.material.uniforms.bi.valueOf = intensity;

		// Request animation frame
		requestAnimationFrame( render );
		
		// Call render()
		renderer.render( scene, camera );
	}
	
	//window.onload = init();

//////////////////////////
//////////////////////////
// Deprecated Functions //
//////////////////////////
//////////////////////////                                     A bird, because I wanted one here, too
//                                                  ,::::.._
//                                                ,':::::::::.
//                                            _,-'`:::,::(o)::`-,.._
//                                         _.', ', `:::::::::;'-..__`.
//                                    _.-'' ' ,' ,' ,\:::,'::-`'''
//                                _.-'' , ' , ,'  ' ,' `:::/
//                          _..-'' , ' , ' ,' , ,' ',' '/::
//                  _...:::'`-..'_, ' , ,'  , ' ,'' , ,'::|
//               _`.:::::,':::::,'::`-:..'_',_'_,'..-'::,'|
//       _..-:::'::,':::::::,':::,':,'::,':::,'::::::,':::;
//         `':,'::::::,:,':::::::::::::::::':::,'::_:::,'/
//         __..:'::,':::::::--''' `-:,':,':::'::-' ,':::/
//    _.::::::,:::.-''-`-`..'_,'. ,',  , ' , ,'  ', `','
//  ,::SSt:''''`                 \:. . ,' '  ,',' '_,'
//                                ``::._,'_'_,',.-'
//                                    \\ \\
//                                     \\_\\
//                                      \\`-`.-'_
//                                   .`-.\\__`. ``
//                                      ``-.-._
//                                          `
