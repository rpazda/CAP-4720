var renderer;
var scene;
var camera;
var spotLight;

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
    setupSpotlights();
    createPlayArea();
    
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
    renderer.setSize( window.innerWidth * 0.7, window.innerHeight * 0.7 );
    renderer.shadowMapEnabled = true;
}

function setupCamera()
{
    camera.position.x = 0;
    camera.position.y = -200;
    camera.position.z = 50;
    camera.lookAt( scene.position );
}

//Create default spotlight
function setupSpotlights()
{
    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 10, 20, 20 );
    spotLight.shadowCameraNear = 20;
    spotLight.shadowCameraFar = 50;
    spotLight.lookAt( new THREE.Vector3( 0, 0, 0 ) );
    scene.add( spotLight );

    spotlight1 = new THREE.SpotLight();
    spotlight2 = new THREE.SpotLight();
    spotlight3 = new THREE.SpotLight();
    spotlight4 = new THREE.SpotLight();
    spotlight5 = new THREE.SpotLight();

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

    spotlight5.position.set(0,-200,10);
    spotlight5.shadowNear = 10;
    spotlight5.shadowFar = 500;
    spotlight5.castShadow = true;
    spotlight5.intensity = 10;
    
    scene.add(spotlight1);
    scene.add(spotlight2);
    scene.add(spotlight3);
    scene.add(spotlight4);
    scene.add(spotlight5);
}


//Render function to update scene
function render()
{
    // Request animation frame
    requestAnimationFrame( render );
    
    // Call render()
    renderer.render( scene, camera );
}

function createPlayArea()
{
    var playSurfaceTexture;
    var playSurfaceMaterial;
    var planeGeometry;
    var playSurface;

    planeGeometry = new THREE.PlaneGeometry(1,1);
    playSurfaceTexture = new THREE.ImageUtils.loadTexture('assets/vaporplane.png');
    playSurfaceMaterial = new THREE.MeshLambertMaterial({map: playSurfaceTexture});
    playSurface = new THREE.Mesh(planeGeometry, playSurfaceMaterial);

    playSurface.scale.x = 800;
    playSurface.scale.y = 800;
    playSurface.name = "PlaySurface";
    
    scene.add(playSurface);
}