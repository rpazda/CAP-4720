	
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
	var column = new THREE.Object3D();

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
		loadColumnTest();
		
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
	var columnLoader = new THREE.OBJMTLLoader();
	var columnMaterial = new THREE.MeshLambertMaterial({color: "white"});
	function loadColumnTest()
	{
		// instantiate a loader
		
		
		// load an obj / mtl resource pair
		columnLoader.load(
			// OBJ resource URL
			'assets/column.obj',
			// MTL resource URL	
			'assets/rook.mtl',
			//columnMaterial,
			// Function when both resources are loaded
			function ( object ) 
			{
				// Added to fix raycasting
				object.castShadow = true;
				object.receiveShadow = true;
				object.scale.set(10,10,10);

				//var playerGamePiece = new THREE.Object3D();
				column.name = 'Column';
				object.parent = column;
				column.add( object );

				scene.add(column);

				column.position.x = 0;
				column.position.y = 0;
			}
		);
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
