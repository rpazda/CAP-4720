var renderer;
var scene;
var camera;
var controls;

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var projector = new THREE.Projector();
var intersects;

var blocker;
var instructions;
var loader = new THREE.TextureLoader();

var cube1, cube2, cube3, cube4, cube5, cube6, cube7, cube8, cube9, cube10, cube11, cube12, masterCube;
var cup1, cup2, cup3, cup4;
var cover1, cover2, cover3, cover4, cover5, cover6, cover7, cover8, cover9, cover10, cover11, cover12, cover13;
var wall1, wall2, wall3, wall4;

var QHz, bermudahigh, biggulp, blindlie, breakingdown, breezy, crush, eccochamber, error, licku, purgatory, readonly, sade;
var jump, land;

var objects = [];
var randoms = [];
var score = 0;

var mouse = {x:0,y:0};
var cameraMoves = {x:0,y:0,z:-0.1,move:false,speed:0.2};

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var justJumped = false;
var controlsEnabled = false;

var speedFactor = 1200.0;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

var devHeight = 350;
var realHeight = 150;

function init()
{
    blocker = document.getElementById( 'blocker' );
    instructions = document.getElementById( 'instructions' );

    pointerLock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf995e7 );
    //scene.fog = new THREE.Fog( 0xc4fcee, 0.1, 750 );

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, .1, 1000);
    camera.rotateY(Math.PI);
    controls = new THREE.PointerLockControls( camera );
    scene.add(controls.getObject() );
    controls.getObject().translateX(-coefficient);
    controls.getObject().translateZ(coefficient);
    

    var onKeyDown = function ( event ) {
        
        switch ( event.keyCode ) {
        
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
        
            case 37: // left
            case 65: // a
                moveLeft = true; break;
        
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
        
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
        
            case 32: // space
                if ( canJump === true ) {
                    jump.play();
                    justJumped = true;
                    velocity.y += realHeight; //350 dev height - 150 real game?
                }
                canJump = false;
                break;
            case 81:
                var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
                projector.unprojectVector( vector, camera );
                raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

                //var intersects = raycaster.intersectObjects( scene.children);
                if ( intersects.length > 0 )
                {
                    for( var i=0; i<intersects.length; i++ )
                    {
                        var obj = intersects[i].object;
                        var name = obj.name;
                        console.log(name);
                        selectTrack(name);
                    }
                }
                break;
        
        }
        
        //updatePosition()
    };

    var onKeyUp = function ( event ) {
        
        switch( event.keyCode ) {
        
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
        
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
        
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
        
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        
        }
        
        //updatePosition()
    };
        
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    setupRenderer();

    //code here
    createFloor();
    loadAlbums();
    createGameBoundaries();
    createColumns();
    createCubes();
    loadMusic();
    loadSounds();
    createJazzCups();
    //create3DText();

    document.body.appendChild( renderer.domElement);

    render();
}

var coefficient = 25;

function animate() {
    
    requestAnimationFrame( animate );
    
    if ( controlsEnabled ) {
        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;
    
        var intersections = raycaster.intersectObjects( objects );
    
        var isOnObject = intersections.length > 0;
    
        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;
    
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
    
        velocity.y -= 9.8 * 50.0 * delta; // 100.0 = mass
        
        if ( moveForward ) velocity.z -= speedFactor * delta;
        if ( moveBackward ) velocity.z += speedFactor * delta;
    
        if ( moveLeft ) velocity.x -= speedFactor * delta;
        if ( moveRight ) velocity.x += speedFactor * delta;
    
        if ( isOnObject === true ) {
            velocity.y = Math.max( 0, velocity.y );
            
            canJump = true;
        }
        
        //Set game world bounds
        var positionX = controls.getObject().position.x;
        var positionZ = controls.getObject().position.z;
        if(positionX < 395 && positionX > -395 && positionZ < 395 && positionZ > -395){
            controls.getObject().translateX( velocity.x * delta );
            controls.getObject().translateY( velocity.y * delta );
            controls.getObject().translateZ( velocity.z * delta );
        }
        else{
            if(positionX > 395){
                controls.getObject().position.x = 390;
            }
            if(positionX < -395){
                controls.getObject().position.x = -390;
            }
            if(positionZ > 390){
                controls.getObject().position.z = 390;
            }
            if(positionZ < -395){
                controls.getObject().position.z = -390;
            }
        }
    
        if ( controls.getObject().position.y < 10 ) {
            if(justJumped)
            {
                land.play();
                justJumped = false;
            }

            velocity.y = 0;
            controls.getObject().position.y = 10;
            
            canJump = true;
    
        }
    
        prevTime = time;
    
    }
}

//Create game play field
function createFloor()
{  
   // floor
   
   var texture = loader.load('assets/vaporplane2.png');
   texture.wrapS = THREE.RepeatWrapping;
   texture.wrapT = THREE.RepeatWrapping;
   texture.repeat.set( 50, 50 );
   geometry = new THREE.PlaneGeometry( 800, 800 );
  
   material = new THREE.MeshLambertMaterial( { map: texture } );
   geometry.rotateX( - Math.PI / 2 );
 
   mesh = new THREE.Mesh( geometry, material );
   scene.add( mesh );
 
   createSpotlight(3*coefficient,20,3*coefficient);
}

function createGameBoundaries()
{
    var texture = loader.load('assets/water.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 5, 1 );
    var material = new THREE.MeshLambertMaterial( { map: texture } );
    var geometry = new THREE.BoxGeometry(800, 40, 2);

    wall1 = new THREE.Mesh(geometry, material);
    scene.add(wall1);

    wall1.position.x = 400;
    wall1.position.y = 20;
    wall1.rotation.y = Math.PI/2;

    wall2 = new THREE.Mesh(geometry, material);
    scene.add(wall2);

    wall2.position.x = -400;
    wall2.position.y = 20;
    wall2.rotation.y = Math.PI/2;

    wall3 = new THREE.Mesh(geometry, material);
    scene.add(wall3);

    wall3.position.z = -400;
    wall3.position.y = 20;

    wall4 = new THREE.Mesh(geometry, material);
    scene.add(wall4);

    wall4.position.z = 400;
    wall4.position.y = 20;
}

var column = new THREE.Object3D();
var columnLoader = new THREE.OBJLoader();
var mtlLoader = new THREE.MTLLoader();
function createColumns()
{
    columnLoader.load(
        // OBJ resource URL
        'assets/column.obj',
        // MTL resource URL	
        //'assets/untitled.mtl',
        // Function when both resources are loaded
        function(object)
        {
            //object.castShadow = true;
            //object.receiveShadow = true;
            object.scale.set(1,1,1);

            //object.parent = column;
            //column.add(object);

            //scene.add(column);
            scene.add(object);
            
            object.position.y = 78;
            object.position.x = 380;
            object.position.z = 380;
            column = object;
        }
        
    );

    columnLoader.load(
        // OBJ resource URL
        'assets/column.obj',
        // MTL resource URL	
        //'assets/untitled.mtl',
        // Function when both resources are loaded
        function(object)
        {
            //object.castShadow = true;
            //object.receiveShadow = true;
            object.scale.set(1,1,1);

            //object.parent = column;
            //column.add(object);

            //scene.add(column);
            scene.add(object);
            
            object.position.y = 78;
            object.position.x = -380;
            object.position.z = 380;
            column = object;
        }
        
    );

    columnLoader.load(
        // OBJ resource URL
        'assets/column.obj',
        // MTL resource URL	
        //'assets/untitled.mtl',
        // Function when both resources are loaded
        function(object)
        {
            //object.castShadow = true;
            //object.receiveShadow = true;
            object.scale.set(1,1,1);

            //object.parent = column;
            //column.add(object);

            //scene.add(column);
            scene.add(object);
            
            object.position.y = 78;
            object.position.x = 380;
            object.position.z = -380;
            column = object;
        }
        
    );

    columnLoader.load(
        // OBJ resource URL
        'assets/column.obj',
        // MTL resource URL	
        //'assets/untitled.mtl',
        // Function when both resources are loaded
        function(object)
        {
            //object.castShadow = true;
            //object.receiveShadow = true;
            object.scale.set(1,1,1);

            //object.parent = column;
            //column.add(object);

            //scene.add(column);
            scene.add(object);
            
            object.position.y = 78;
            object.position.x = -380;
            object.position.z = -380;
            column = object;
        }
        
    );

    mtlLoader.load(
        // MTL resource URL	
        'assets/rook.mtl',
        // Function when both resources are loaded
        function(object)
        {
            
            column.add(object);
        }
    );
}

function createCubes(){
    createCustomShaderCubes();
    createN64Cube();
}

function createCustomShaderCubes()
{   
    var size = 100; 
    var Ycoord = 150;
    var radius = 400;
    var sqrtthreetwo = Math.sqrt(3)/2;
    var half = 0.5;

    var material = createCustomMaterialFromGLSLCode("fragment");
    var geometry = new THREE.BoxGeometry(size, size, size);

    cube1 = new THREE.Mesh(geometry, material);
    cube2 = new THREE.Mesh(geometry, material);
    cube3 = new THREE.Mesh(geometry, material);
    cube4 = new THREE.Mesh(geometry, material);
    cube5 = new THREE.Mesh(geometry, material);
    cube6 = new THREE.Mesh(geometry, material);
    cube7 = new THREE.Mesh(geometry, material);
    cube8 = new THREE.Mesh(geometry, material);
    cube9 = new THREE.Mesh(geometry, material);
    cube10 = new THREE.Mesh(geometry, material);
    cube11 = new THREE.Mesh(geometry, material);
    cube12 = new THREE.Mesh(geometry, material);
    
    scene.add(cube1);
    scene.add(cube2);
    scene.add(cube3);
    scene.add(cube4);
    scene.add(cube5);
    scene.add(cube6);
    scene.add(cube7);
    scene.add(cube8);
    scene.add(cube9);
    scene.add(cube10);
    scene.add(cube11);
    scene.add(cube12);

    cube1.position.x = radius;
    cube1.position.y = Ycoord;
    cube1.position.z = 0;

    cube2.position.x = 0;
    cube2.position.y = Ycoord;
    cube2.position.z = -radius;

    cube3.position.x = 0;
    cube3.position.y = Ycoord;
    cube3.position.z = radius;
    
    cube4.position.x = -radius;
    cube4.position.y = Ycoord;
    cube4.position.z = 0;

    cube5.position.x = radius*half;
    cube5.position.y = Ycoord;
    cube5.position.z = radius*sqrtthreetwo;
    
    cube6.position.x = radius*sqrtthreetwo;
    cube6.position.y = Ycoord;
    cube6.position.z = radius*half;

    cube7.position.x = -radius*half;
    cube7.position.y = Ycoord;
    cube7.position.z = -radius*sqrtthreetwo;

    cube8.position.x = -radius*sqrtthreetwo;
    cube8.position.y = Ycoord;
    cube8.position.z = -radius*half;

    cube9.position.x = radius*sqrtthreetwo;
    cube9.position.y = Ycoord;
    cube9.position.z = -radius*half;

    cube10.position.x = -radius*sqrtthreetwo;
    cube10.position.y = Ycoord;
    cube10.position.z = radius*half;

    cube11.position.x = radius*half;
    cube11.position.y = Ycoord;
    cube11.position.z = -radius*sqrtthreetwo;

    cube12.position.x = -radius*half;
    cube12.position.y = Ycoord;
    cube12.position.z = radius*sqrtthreetwo;

}

function createN64Cube()
{   
    var size = 300;
    var texture = loader.load('assets/n64.png');
    var material = new THREE.MeshLambertMaterial( { map: texture } );
    var geometry = new THREE.BoxGeometry(size, size, size); 
    //var geometry = new THREE.CylinderGeometry( 85, 49, 260, 32 );

    masterCube = new THREE.Mesh(geometry, material);
    masterCube.name = "master";
    scene.add(masterCube);

    masterCube.position.y = 500;

    masterCube.rotation.x = 150;
    masterCube.rotation.y = 150;
}

function createJazzCups()
{
    var texture = loader.load('assets/jazz.jpg');
    var cupMaterial = new THREE.MeshLambertMaterial( { map: texture } );
    var cupGeometry = new THREE.CylinderGeometry( 35, 23, 120, 32 );

    cup1 = new THREE.Mesh(cupGeometry, cupMaterial);
    cup2 = new THREE.Mesh(cupGeometry, cupMaterial);
    cup3 = new THREE.Mesh(cupGeometry, cupMaterial);
    cup4 = new THREE.Mesh(cupGeometry, cupMaterial);
    scene.add(cup1);
    scene.add(cup2);
    scene.add(cup3);
    scene.add(cup4);

    cup1.position.x = 380;
    cup1.position.y = 215;
    cup1.position.z = 380;
    
    cup2.position.x = 380;
    cup2.position.y = 215;
    cup2.position.z = -380;

    cup3.position.x = -380;
    cup3.position.y = 215;
    cup3.position.z = 380;

    cup4.position.x = -380;
    cup4.position.y = 215;
    cup4.position.z = -380;

    cup2.rotation.y += Math.PI;
    cup4.rotation.y += Math.PI;
}

function rotateCubes()
{
    cube1.rotation.x += 0.002;
    cube1.rotation.y += 0.002;
    cube1.rotation.z += 0.002;

    cube2.rotation.x += 0.002;
    cube2.rotation.y += 0.002;
    cube2.rotation.z += 0.002;

    cube3.rotation.x += 0.002;
    cube3.rotation.y += 0.002;
    cube3.rotation.z += 0.002;

    cube4.rotation.x += 0.002;
    cube4.rotation.y += 0.002;
    cube4.rotation.z += 0.002;

    cube5.rotation.x += 0.002;
    cube5.rotation.y += 0.002;
    cube5.rotation.z += 0.002;

    cube6.rotation.x += 0.002;
    cube6.rotation.y += 0.002;
    cube6.rotation.z += 0.002;

    cube7.rotation.x += 0.002;
    cube7.rotation.y += 0.002;
    cube7.rotation.z += 0.002;

    cube8.rotation.x += 0.002;
    cube8.rotation.y += 0.002;
    cube8.rotation.z += 0.002;

    cube9.rotation.x += 0.002;
    cube9.rotation.y += 0.002;
    cube9.rotation.z += 0.002;

    cube10.rotation.x += 0.002;
    cube10.rotation.y += 0.002;
    cube10.rotation.z += 0.002;

    cube11.rotation.x += 0.002;
    cube11.rotation.y += 0.002;
    cube11.rotation.z += 0.002;

    cube12.rotation.x += 0.002;
    cube12.rotation.y += 0.002;
    cube12.rotation.z += 0.002;

    masterCube.rotation.x += 0.0002;
    masterCube.rotation.y += 0.0002;
    masterCube.rotation.z += 0.0002;
}

function loadAlbums()
{
    var cover1texture = loader.load('assets/covers/bb-bb1.png');
    var cover2texture = loader.load('assets/covers/bb-mega.png');
    var cover3texture = loader.load('assets/covers/christtt-frasier.jpg');
    var cover4texture = loader.load('assets/covers/cobaltroad-purgatory.png');
    var cover5texture = loader.load('assets/covers/danmason-summertime.png');
    var cover6texture = loader.load('assets/covers/ecovirtual-atmos1.png');
    var cover7texture = loader.load('assets/covers/ecovirtual-atmos4.png');
    var cover8texture = loader.load('assets/covers/javaexe-floatingpt.png');
    var cover9texture = loader.load('assets/covers/javaexe-loading.png');
    var cover10texture = loader.load('assets/covers/javaexe-ruins.jpg');
    var cover11texture = loader.load('assets/covers/megabunneh-collection.png');
    var cover12texture = loader.load('assets/covers/miketenay-biz87.png');
    var cover13texture = loader.load('assets/covers/vektroid-floralshoppe.jpg');
    
    geometry = new  THREE.BoxGeometry(25, 25, 25);//THREE.PlaneGeometry( 50, 50 );
    var cover13geometry = new  THREE.BoxGeometry(100,100,100);

    cover1material = new THREE.MeshLambertMaterial( { map: cover1texture } );
    cover2material = new THREE.MeshLambertMaterial( { map: cover2texture } );
    cover3material = new THREE.MeshLambertMaterial( { map: cover3texture } );
    cover4material = new THREE.MeshLambertMaterial( { map: cover4texture } );
    cover5material = new THREE.MeshLambertMaterial( { map: cover5texture } );
    cover6material = new THREE.MeshLambertMaterial( { map: cover6texture } );
    cover7material = new THREE.MeshLambertMaterial( { map: cover7texture } );
    cover8material = new THREE.MeshLambertMaterial( { map: cover8texture } );
    cover9material = new THREE.MeshLambertMaterial( { map: cover9texture } );
    cover10material = new THREE.MeshLambertMaterial( { map: cover10texture } );
    cover11material = new THREE.MeshLambertMaterial( { map: cover11texture } );
    cover12material = new THREE.MeshLambertMaterial( { map: cover12texture } );
    cover13material = new THREE.MeshLambertMaterial( { map: cover13texture } );
    //geometry.rotateX( - Math.PI / 2 );

    var hoverHeight = 20;
    var distanceZ = -200;
  
    cover1 = new THREE.Mesh( geometry, cover1material );
    cover1.name = "bb-bb1";
    scene.add( cover1 );

    cover1.position.x = -240;
    cover1.position.z = distanceZ;
    cover1.position.y = hoverHeight;

    cover2 = new THREE.Mesh( geometry, cover2material );
    cover2.name = "bb-mega";
    scene.add( cover2 );

    cover2.position.x = -200;
    cover2.position.z = distanceZ;
    cover2.position.y = hoverHeight;

    cover3 = new THREE.Mesh( geometry, cover3material );
    cover3.name = "christtt-frasier";
    scene.add( cover3 );

    cover3.position.x = -160;
    cover3.position.z = distanceZ;
    cover3.position.y = hoverHeight;

    cover4 = new THREE.Mesh( geometry, cover4material );
    cover4.name = "cobaltroad-purgatory";
    scene.add( cover4 );

    cover4.position.x = -120;
    cover4.position.z = distanceZ;
    cover4.position.y = hoverHeight;

    cover5 = new THREE.Mesh( geometry, cover5material );
    cover5.name = "danmason-summertime";
    scene.add( cover5 );

    cover5.position.x = -80;
    cover5.position.z = distanceZ;
    cover5.position.y = hoverHeight;

    cover6 = new THREE.Mesh( geometry, cover6material );
    cover6.name = "ecovirtual-atmos1";
    scene.add( cover6 );

    cover6.position.x = -40;
    cover6.position.z = distanceZ;
    cover6.position.y = hoverHeight;

    cover7 = new THREE.Mesh( geometry, cover7material );
    cover7.name = "ecovirtual-atmos4";
    scene.add( cover7 );

    cover7.position.x = 0;
    cover7.position.z = distanceZ;
    cover7.position.y = hoverHeight;

    cover8 = new THREE.Mesh( geometry, cover8material );
    cover8.name = "javaexe-floatingpt";
    scene.add( cover8 );

    cover8.position.x = 40;
    cover8.position.z = distanceZ;
    cover8.position.y = hoverHeight;

    cover9 = new THREE.Mesh( geometry, cover9material );
    cover9.name = "javaexe-loading";
    scene.add( cover9 );

    cover9.position.x = 80;
    cover9.position.z = distanceZ;
    cover9.position.y = hoverHeight;

    cover10 = new THREE.Mesh( geometry, cover10material );
    cover10.name = "javaexe-ruins";
    scene.add( cover10 );

    cover10.position.x = 120;
    cover10.position.z = distanceZ;
    cover10.position.y = hoverHeight;

    cover11 = new THREE.Mesh( geometry, cover11material );
    cover11.name = "megabunneh-collection";
    scene.add( cover11 );

    cover11.position.x = 160;
    cover11.position.z = distanceZ;
    cover11.position.y = hoverHeight;

    cover12 = new THREE.Mesh( geometry, cover12material );
    cover12.name = "miketenay-biz87";
    scene.add( cover12 );

    cover12.position.x = 200;
    cover12.position.z = distanceZ;
    cover12.position.y = hoverHeight;

    cover13 = new THREE.Mesh( cover13geometry, cover13material );
    cover13.name = "vektroid-floralshoppe";
    scene.add( cover13 );

    cover13.position.x = 0;
    cover13.position.z = 300;
    cover13.position.y = 50;
}

function loadMusic()
{
    /*  Track List:
        Blank Banshee - Big Gulp
        Blank Banshee - Ecco Chamber
        christtt - blind lie
        Cobalt Road - Purgatory
        Dan Mason - Breaking Down
        ECO VIRTUAL - Bermuda High
        ECO VIRTUAL - Breezy
        J Λ V Λ . E X E - 切り捨てＥＲＲＯＲ
        J Λ V Λ . E X E - 4096 QHz
        J Λ V Λ . E X E - ＲＥＡＤ－ＯＮＬＹ思い出
        Mega Bunneh - Crush
        Mike Tenay - Lick U
        Macintosh Plus - ブート
    */

    QHz = new Audio("music/4096QHz.mp3");
    bermudahigh = new Audio("music/bermuda-high.mp3");
    biggulp = new Audio("music/big-gulp.mp3");
    blindlie = new Audio("music/blind-lie.mp3");
    breakingdown = new Audio("music/breaking-down.mp3");
    breezy = new Audio("music/breezy.mp3");
    crush = new Audio("music/crush.mp3");
    eccochamber = new Audio("music/ecco-chamber.mp3");
    error = new Audio("music/error.mp3");
    licku = new Audio("music/lick-u.mp3");
    purgatory = new Audio("music/purgatory.mp3");
    readonly = new Audio("music/read-only.mp3");
    sade = new Audio("music/sade.mp3");

}

function loadSounds()
{
    jump = new Audio("sounds/jump.mp3");
    land = new Audio("sounds/land.mp3");
}

function selectTrack(name)
{
    pauseMusic();

    switch (name) {
        case("master"):
            break;
        case "bb-bb1":
            biggulp.play();
            updateNowPlaying("Blank Banshee - Big Gulp from Blank Banshee 1");
            break;
        case "bb-mega":
            eccochamber.play();
            updateNowPlaying("Blank Banshee - Ecco Chamber from MEGA");
            break;
        case "christtt-frasier":
            blindlie.play();
            updateNowPlaying("christtt - blind lie from frasierwave");
            break;
        case "cobaltroad-purgatory":
            purgatory.play();
            updateNowPlaying("Cobalt Road - Purgatory from Purgatory");
            break;
        case "danmason-summertime":
            breakingdown.play();
            updateNowPlaying("Dan Mason - Breaking Down from Summertime EP");
            break;
        case "ecovirtual-atmos1":
            bermudahigh.play();
            updateNowPlaying("ECO VIRTUAL - Bermuda High from ATMOSPHERES 1");
            break;
        case "ecovirtual-atmos4":
            breezy.play();
            updateNowPlaying("ECO VIRTUAL - Breezy from ATMOSPHERES 4");
            break;
        case "javaexe-floatingpt":
            error.play();
            updateNowPlaying("JΛVΛ.EXE - ＥＲＲＯＲ from floating point");
            break;
        case "javaexe-loading":
            QHz.play();
            updateNowPlaying("JΛVΛ.EXE - 4096QHz from loading...");
            break;
        case "javaexe-ruins":
            readonly.play();
            updateNowPlaying("JΛVΛ.EXE - ＲＥＡＤ－ＯＮＬＹ from ruins");
            break;
        case "megabunneh-collection":
            crush.play();
            updateNowPlaying("Mega Bunneh - Crush from A Collection...");
            break;
        case "miketenay-biz87":
            licku.play();
            updateNowPlaying("Mike Tenay - Lick U from F%$k Business Casual '87");
            break;
        case "vektroid-floralshoppe":
            sade.play();
            updateNowPlaying("Macintosh Plus - ブート from Floral Shoppe");
            break;
        default:
            break;
    }
}

function pauseMusic()
{
    QHz.pause();
    bermudahigh.pause();
    biggulp.pause();
    blindlie.pause();
    breakingdown.pause();
    breezy.pause();
    crush.pause();
    eccochamber.pause();
    error.pause();
    licku.pause();
    purgatory.pause();
    readonly.pause();
    sade.pause();

    updateNowPlaying("");
}

function createSpotlight(x,y,z)
{
    var spotLight, ambient = new THREE.AmbientLight(0x888888);

    ambient.intensity = 1.8;
    scene.add(ambient);
    spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( x, y, z );
    spotLight.shadowCameraNear = 10;
    spotLight.shadowCameraFar = 100;
    spotLight.castShadow = true;
    spotLight.intensity = 1;
    //scene.add(spotLight);
}

function setupRenderer()
{
    renderer = new THREE.WebGLRenderer();

    renderer.setClearColor( 0x000000, 1.0 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMapEnabled = true;
}


function render()
{
    animate();
    rotateCubes();

    intersects = raycaster.intersectObjects( scene.children);

    // Request animation frame
    requestAnimationFrame( render );
    
    // Call render()
    renderer.render( scene, camera );
}

function create3DText()
{
    var textString = "Collect the pellets!";

    var textObjectGeometry = new THREE.TextGeometry(string, {
        size: 3,
        height: 1,
        curveSegments: 10,
        bevelEnabled: false
    });

    var textObjectMaterial = new THREE.MeshLambertMaterial({color:'rgb(0, 255, 180)'});

    textObject = new THREE.Mesh( textObjectGeometry, textObjectMaterial);

    textObject.position.x = -17;
    textObject.position.y = 30;
    textObject.position.z = 7;
    textObject.rotation.x = Math.PI/2;

    scene.add(textObject);
}

function updateNowPlaying(string)
{
    if(!string){
        $("#now-playing").empty();
    }
    else{
        $("#now-playing").html("<span class='text-highlight-color'>Now Playing: </span>" + string);
    }
}


window.onload = init;
