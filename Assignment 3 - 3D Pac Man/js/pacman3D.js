	/*
        Requirements:
        For a grad of C, you need the following:
            --1. a textured plane upon which the objects are placed and move
            --2. a maze made of 3d walls
            --3. a moving camera that moves you through the maze
            --4. A Physijs compliant physics-based 3D world
            --5. Sounds and optional music
            --6. At least four objects that chase you.
            --7. pellets in halls to eat
            --8. 3D text
            --9. Score
            --10. Simple help for play keys
            --11. Your name somewhere in the game

        Going past a grade of C, you can add any combination of the following (you don't need them all to get 100):
            1. The ability to jump or something similar
            --2. Music
            3. Changing chaser colors and speeds.

        TODO:   
            --Fix camera angles
            -Enable collision detection
    
     */ 

/* 40x40 maze design, too big

var maze = ['****************************************',
            '*###########*#####*##*#####*###########*',
            '*#***********#####*##*#####***********#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*############**********############*#*',
            '***############*########*############***',
            '*##############*########*##############*',
            '*##############*########*##############*',
            '*##############*########*##############*',
            '*##############*########*##############*',
            '****************************************',
            '*#*############*###xx###*############*#*',
            '*#************#*#xxxxxx#*#************#*',
            '*############*#*#xxxxxx#*#*############*',
            '*############*#*#xxxxxx#*#*############*',
            '*############*#*#xxxxxx#*#*############*',
            '*############*#*########*#*############*',
            '****************************************',
            '*######################################*',
            '*######################################*',
            '***##################################***',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*###############*##*###############*#*',
            '*#*##################################*#*',
            '*#***********##############***********#*',
            '*###########*#####*##*#####*###########*',
            '****************************************'];
*/  
    var maze = [    // 20x20 grid on 400x400 plane, so each unit is 20x20 units
    '********************',
    '*#####*#*##*#*#####*',
    '*#*****#*##*#*****#*',
    '*#*#*#********#*#*#*',
    '*#*#*###*##*###*#*#*',
    '*#*#************#*#*',
    '***#*##########*#***',
    '*###************###*',
    '*****#*##xx##*#*****',
    '*###*#*#xxxx#*#*###*',
    '*#***#*#xxxx#*#***#*',
    '*#*#*#*######*#*#*#*',
    '*#*#************#*#*',
    '*****###*##*###*****',
    '*#*#***#*##*#***#*#*',
    '*#*#*#*#****#*#*#*#*',
    '*#*#*#*######*#*#*#*',
    '*#****************#*',
    '*#####*#*##*#*#####*',
    '********************'];
    
    //Core graphic components
    var renderer, rendererHUD;
	var scene;
	var camera, cameraHUD;
    var spotlight;

    //var hudWidth = 300;

    //Cosmetic defaults
    var defaultMusic, pointAdd, ooft;  //default music, sounds
    var musicPlaying = true;
    var soundEnabled = true;
    var gamePaused = false;
    var gameEnded = false;
    
    //Main game models
    var character;
    //Ghost pieces
    var ghostHeadRed, ghostBodyRed;
    var ghostHeadBlue, ghostBodyBlue;
    var ghostHeadYellow, ghostBodyYellow;
    var ghostHeadPink, ghostBodyPink;
    //Full ghosts [not used]
    var ghostRed, ghostBlue, ghostYellow, ghostPink;
    
    //Base game elements
    var pelletsCount = 0;
    //var pellets = new Array();
    var score = 0;
    var lives = 3;

    //Speed modifiers
    var playerSpeed = 1;
    var playerStrafeSpeed = 0.5;
    var ghostSpeed = 0.01;
    
    //Core navigation components
        /* I'm not thrilled with this approach but it works. Using this array
            and keeping x and y offset by 1 means that incrementing or decrementing
            both allows cycling through -> (1,0) <-> (0,1) <-> (0,-1) <-> (-1,0) <-,
            the basic 90 translations on an xy-plane.*/
    var playerDirections = [0,1,0,-1]
    var playerDirectionX = 0; //Indices on direction array
    var playerDirectionY = 1;

    Physijs.scripts.worker = 'libs/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';

    ///Actually starts game, removes start game button
    function beginGame()
    {
        init();
        $("#begin-game").remove();
    }
	
    ///Initialize everything to run the game
	function init()
	{
		//scene = new THREE.Scene();
        scene = new Physijs.Scene();
        scene.setGravity(new THREE.Vector3(0, 0, 0));

		camera = new THREE.PerspectiveCamera(
		// frustum vertical view         aspect ratio							 frustum near plane     frustum far plane
			45,                          window.innerWidth / window.innerHeight, 0.1,                   1000 );
        //cameraHUD = new THREE.PerspectiveCamera(45, 1, 0.1, 4000);
        
		setupRenderers();
		setupCamera();
        setupSpotlight();
		
		// Main code
        
        //Fundamental gameplay elements
        createPlayField();  //Create basic plane
        createMazeBoundaries(); //Creat outer maze walls
        createMaze();   //Create maze and pellets
        createPlayerCharacter();    //Create yellow super hero pill man
        createGhosts(); //Create our hero's nemeses
        //createPellets();  //Old version of function from before maze actually created
        create3DText();

        //Cosmetics
        initGamePanel();    //Set all HUD elements to initial values
        loadMusic();    //Load background music
        loadSounds();   //Load sounds

		
		// Output to the stream
		//document.body.appendChild( renderer.domElement );
        //$("#game-window").append(renderer);
        document.getElementById("game-window").appendChild(renderer.domElement);
        //$("#hud-map").append(rendererHUD);
        //document.getElementById("hud-map").appendChild(rendererHUD.domElement);
		
		// Call render
		render();
	}
	
	function setupRenderers()
	{
		renderer = new THREE.WebGLRenderer();
		//						color     alpha
		renderer.setClearColor( 0x000000, 1.0 );
		//renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setSize(900,650);
		renderer.shadowMapEnabled = true;

        //rendererHUD = new THREE.WebGLRenderer();
        //rendererHUD.setClearColor(0x000000, 0);
        //rendererHUD.setSize(300, 300);
        //rendererHUD.shadowMapEnabled = true;
	}
	
	function setupCamera()
	{
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 500;
		camera.lookAt( scene.position );

        //cameraHUD.position.y = 41;
        //cameraHUD.lookAt(new THREE.Vector3(0,0,0));
	}
	
	function render()
	{   
        if(gamePaused == false && !gameEnded)
        {
            scene.simulate();

            controlCharacter(); //Enable character control
            //preventPhasing(); //Detect and prevent phasing through walls
            detectPelletCollection();   //Detect pellet collection and update score
            moveGhosts();
            //moveGhostsCenter();   //Function for testing ghosts without player
            preventOutOfBounds();
            detectGhostAttack();

            // Request animation frame
            requestAnimationFrame( render );
            
            // Call render()
            renderer.setViewport(0,0, $("#game-window").width(), $("#game-window").height());
            renderer.render( scene, camera );
            
            //rendererHUD.setScissorTest(true);
            //rendererHUD.enableScissorTest();
            //rendererHUD.setViewport(0,0, 300, 300);
            //rendererHUD.render(scene, cameraHUD);
        }
	}

    ///Display default game panel values
    function initGamePanel()
    {
        updateLivesCounter();
        updatePelletsCounter();
        updateScoreDisplay();
    }

    ///Refresh score display panel
    function updateScoreDisplay()
    {
        $("#score-display").html(score);
    }
    
    ///Display a life icon for each remaining life
    function updateLivesCounter()
    {   
        $("#lives-display").empty();    //clear lives display

        //Add a life image for each remaining life
        for(i = 0; i < lives; i++)
        {
            $("#lives-display").append("<img src='assets/life-icon.png'></img>");
        }
    }

    ///Refresh contents of pellets counter 
    function updatePelletsCounter()
    {
        $("#pellets-counter").html(pelletsCount);
    }

    ///Create base game field, a 400x400 plane
    function createPlayField()
    {
        var fieldSurface;
        var fieldMaterial;
        var planeMaterial;

        fieldSurface = THREE.ImageUtils.loadTexture('assets/ground.png');
        fieldMaterial = new THREE.MeshLambertMaterial({map: fieldSurface});
        //planeMaterial = new Physijs.createMaterial(fieldMaterial, 0.4, 0.8);

        var planeGeometry = new THREE.PlaneGeometry(400,400, 6);
        //var playField = new Physijs.BoxMesh(planeGeometry, planeMaterial,0);
        var playField = new THREE.Mesh(planeGeometry, fieldMaterial);
        playField.name = "PlayField";
        scene.add(playField);
    }

    //Create default spotlights, two in opposite corners for good coverage
    function setupSpotlight()
    {
        spotlight1 = new THREE.SpotLight();
        spotlight2 = new THREE.SpotLight();

		spotlight1.position.set(500,500,300);
		spotlight1.shadowNear = 10;
		spotlight1.shadowFar = 100;
		spotlight1.castShadow = true;
		spotlight1.intensity = 1.4;

        spotlight2.position.set(-500,-500,100);
		spotlight2.shadowNear = 10;
		spotlight2.shadowFar = 100;
		spotlight2.castShadow = true;
		spotlight2.intensity = 1.4;
		
        scene.add(spotlight1);
        scene.add(spotlight2);
    }

    //Create player character, a yellow sphere
    function createPlayerCharacter()
    {
        var pacmanGeometry = new THREE.SphereGeometry(4, 32, 32);
        var pacmanMaterialBase = new THREE.MeshLambertMaterial({color:'yellow'}, 0.95, 0.95);
        var pacmanMaterial = Physijs.createMaterial(pacmanMaterialBase);
        //character = new Physijs.SphereMesh(pacmanGeometry, pacmanMaterial);
        character = new THREE.Mesh(pacmanGeometry, pacmanMaterialBase);

        character.position.z = 2.5;
        character.name = "Character";

        character.addEventListener('collision', function(other_object, linear_velocity, angular_velocity){
            if( other_object.name == "Pellet")
            {	
                score++;
                updateScoreDisplay();
                scene.remove(other_object);
            }
        });

        scene.add(character);
        camera.position.x = character.position.x;
        camera.position.y = character.position.y - 20;
        camera.position.z = 10;
        camera.lookAt(character.position);
    }

    ///Create four ghosts, one in each corner in four colors
    function createGhosts()
    {
        createGhost(190, 190, "red", "RedGhost");
        createGhost(-190, -190, "blue", "BlueGhost");
        createGhost(-190, 190, "yellow", "YellowGhost");
        createGhost(190, -190, "pink", "PinkGhost");

    }

    ///Relatively generic create ghost function for the the four ghosts
    function createGhost(xpos, ypos, ghostColor, name)
    {   
        var ghostMaterial = new THREE.MeshLambertMaterial({color: ghostColor});
        var ghostHeadGeometry = new THREE.SphereGeometry(4, 32, 32);
        var ghostBodyGeometry = new THREE.CylinderGeometry(4, 4, 4, 32, 32);

        var ghostHead = new THREE.Mesh(ghostHeadGeometry, ghostMaterial);
        var ghostBody = new THREE.Mesh(ghostBodyGeometry, ghostMaterial);
        ghostBody.rotation.x = Math.PI/2;
        
        var ghostHeadHeight = 6;
        var ghostBodyHeight = 4;

        switch(ghostColor)
        {
            case("red"):
                ghostHeadRed = ghostHead;
                ghostBodyRed = ghostBody;
                ghostHeadRed.position.x = xpos;
                ghostHeadRed.position.y = ypos;
                ghostHeadRed.position.z = ghostHeadHeight;
                ghostBodyRed.position.x = xpos;
                ghostBodyRed.position.y = ypos;
                ghostBodyRed.position.z = ghostBodyHeight;
                scene.add(ghostHeadRed);
                scene.add(ghostBodyRed);
                break;
            case("blue"):
                ghostHeadBlue = ghostHead;
                ghostBodyBlue = ghostBody;
                scene.add(ghostHeadBlue);
                scene.add(ghostBodyBlue);
                ghostHeadBlue.position.x = xpos;
                ghostHeadBlue.position.y = ypos;
                ghostHeadBlue.position.z = ghostHeadHeight;
                ghostBodyBlue.position.x = xpos;
                ghostBodyBlue.position.y = ypos;
                ghostBodyBlue.position.z = ghostBodyHeight;
                break;
            case("yellow"):
                ghostHeadYellow = ghostHead;
                ghostBodyYellow = ghostBody;
                scene.add(ghostHeadYellow);
                scene.add(ghostBodyYellow);
                ghostHeadYellow.position.x = xpos;
                ghostHeadYellow.position.y = ypos;
                ghostHeadYellow.position.z = ghostHeadHeight;
                ghostBodyYellow.position.x = xpos;
                ghostBodyYellow.position.y = ypos;
                ghostBodyYellow.position.z = ghostBodyHeight;
                break;
            case("pink"):
                ghostHeadPink = ghostHead;
                ghostBodyPink = ghostBody;
                scene.add(ghostHeadPink);
                scene.add(ghostBodyPink);
                ghostHeadPink.position.x = xpos;
                ghostHeadPink.position.y = ypos;
                ghostHeadPink.position.z = ghostHeadHeight;
                ghostBodyPink.position.x = xpos;
                ghostBodyPink.position.y = ypos;
                ghostBodyPink.position.z = ghostBodyHeight;
                break;
            default:
                break;
        }
    }


    ///Create the outer walls of the maze
    function createMazeBoundaries()
    {   
        //var wallMaterial = new THREE.MeshBasicMaterial({color: 'white'});
        //var wallMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 'white'}), 0.95, 0.95);
        wallSurface = THREE.ImageUtils.loadTexture('assets/walls.png');
        wallMaterial = new THREE.MeshLambertMaterial({map: wallSurface});

        var wallSidesGeometry = new THREE.BoxGeometry(0.5, 400, 40);
        var wallTopBottomGeometry = new THREE.BoxGeometry(400, 0.5, 40);

        var wallLeftSide = new THREE.Mesh(wallSidesGeometry, wallMaterial);
        var wallRightSide = new THREE.Mesh(wallSidesGeometry, wallMaterial);
        var wallTop = new THREE.Mesh(wallTopBottomGeometry, wallMaterial );
        var wallBottom = new THREE.Mesh(wallTopBottomGeometry, wallMaterial);

        /*
        var wallLeftSide = new Physijs.BoxMesh(wallSidesGeometry, wallMaterial);
        var wallRightSide = new Physijs.BoxMesh(wallSidesGeometry, wallMaterial);
        var wallTop = new Physijs.BoxMesh(wallTopBottomGeometry, wallMaterial );
        var wallBottom = new Physijs.BoxMesh(wallTopBottomGeometry, wallMaterial);
        */
        
        scene.add(wallLeftSide);
        scene.add(wallRightSide);
        scene.add(wallBottom);
        scene.add(wallTop);    

        wallTop.position.y = 200;
        wallRightSide.position.x = 200;
        wallLeftSide.position.x = -200;
        wallBottom.position.y = -200;
    }

    ///Create the maze itself using array maze. "*" are pellets, "#" are walls, "x" is empty space
    //i,j swapped for 90 degree rotation, inverted for 180 degree rotation to match visual array appearance
    function createMaze()
    {
        for(i = 0; i < 20; i++)
        {
            for(j = 0; j < 20; j++)
            {
                if(maze[j][i] == '*')
                {   //Create pellets where dictated, in center of 20u blocks, starts 190
                    generatePellet((i*20 - 190), (190 - j*20));
                }
                else if(maze[j][i] == '#')
                {   //Create walls where dictated, filling center of 20u blocks, starts 190
                    generateWallSegment((i*20 - 190), (190 - j*20));
                }
                else if(maze[j][i] == 'x')
                {   //If empty space make nothing
                }
            }
        }

        // var pelletRow = [];
        // for(i = 0; i<20; i++)
        // {
        //     for(j = 0; j < 20; j++)
        //     {
        //         pelletRow.push(false);
        //     }
        //     pellets.push(pelletRow);
        // }
    }

    var pelletGeometry = new THREE.BoxGeometry(2,2,2);
    var pelletMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 'purple'}), 0.95, 0.95);
    
    ///Generic function for creating pellets at x,y coords
    function generatePellet(xpos, ypos)
    {
        var pellet = new Physijs.BoxMesh(pelletGeometry, pelletMaterial);
        pelletsCount++;

        pellet.name = "Pellet"+xpos+ypos;

        pellet.position.x = xpos;
        pellet.position.y = ypos;
        pellet.position.z = 2.5;

        //console.log("Pellet added at: ("+ pellet.position.x +","+pellet.position.y+",2.5)");
        //console.log(pellet.name);

        scene.add(pellet);
    }

    var wallSegmentGeometry = new THREE.BoxGeometry(20,20,20);
    //var wallSegmentMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 'white'}), 0.95, 0.95);

    wallSegmentSurface = THREE.ImageUtils.loadTexture('assets/walls.png');
    wallSegmentMaterial = new THREE.MeshLambertMaterial({map: wallSegmentSurface});

    ///Generic function for creating wall segments at x,y coords
    function generateWallSegment(xpos, ypos)
    {
        var wallSegment = new Physijs.BoxMesh(wallSegmentGeometry, wallSegmentMaterial);

        wallSegment.name = "Wall";

        wallSegment.position.x = xpos;
        wallSegment.position.y = ypos;
        wallSegment.position.z = 5;

        scene.add(wallSegment);
    }


    //NOT USED, old pellet function
    function createPellets()
    {
        for(i = -9; i < 10; i++)
        {
            for(j = -9; j < 10; j++)
            {
                //var pelletGeometry = new THREE.SphereGeometry(2);
                var pelletGeometry = new THREE.BoxGeometry(2,2,2);
                //var pelletMaterial = new THREE.MeshLambertMaterial({color: 'purple'}, 0.95, 0.95);
                var pellet = new THREE.Mesh(pelletGeometry, pelletMaterial);
                var pelletMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 'purple'}), 0.95, 0.95);
                //let pellet = new Physijs.SphereMesh(pelletGeometry, pelletMaterial);
                var pellet = new Physijs.BoxMesh(pelletGeometry, pelletMaterial);
                pelletsCount++;

                pellet.addEventListener('collision', function(other_object, linear_velocity, angular_velocity){
                    if( other_object.name == "Character")
                    {	
                        console.log('collision detected');
                        score++;
                        updateScoreDisplay();
                        scene.remove(pellet);
                    }
                });
                
                scene.add(pellet);
                pellet.position.x = i*20;
                pellet.position.y = j*20;
                pellet.position.z = 2.5;

                console.log("Pellet added at: ("+ pellet.position.x +","+pellet.position.y+",2.5)");

                pellet.name = "Pellet";

                
            }
        }
        updatePelletsCounter();
    }

    ///Simple movement algorithm for ghosts
    function moveGhosts()
    {
        moveGhost("red", 
                    (character.position.x - ghostBodyRed.position.x) * ghostSpeed, 
                    (character.position.y - ghostBodyRed.position.y) * ghostSpeed);
        moveGhost("blue", 
                    (character.position.x - ghostBodyBlue.position.x) * ghostSpeed, 
                    (character.position.y - ghostBodyBlue.position.y) * ghostSpeed);
        moveGhost("yellow", 
                    (character.position.x - ghostBodyYellow.position.x) * ghostSpeed, 
                    (character.position.y - ghostBodyYellow.position.y) * ghostSpeed);
        moveGhost("pink", 
                    (character.position.x - ghostBodyPink.position.x) * ghostSpeed, 
                    (character.position.y - ghostBodyPink.position.y) * ghostSpeed);
    }

    ///Function for testing ghost movement without player present
    function moveGhostsCenter()
    {
        moveGhost("red", 
                    (0 - ghostBodyRed.position.x) * ghostSpeed, 
                    (0 - ghostBodyRed.position.y) * ghostSpeed);
        moveGhost("blue", 
                    (0- ghostBodyBlue.position.x) * ghostSpeed, 
                    (0 - ghostBodyBlue.position.y) * ghostSpeed);
        moveGhost("yellow", 
                    (0 - ghostBodyYellow.position.x) * ghostSpeed, 
                    (0 - ghostBodyYellow.position.y) * ghostSpeed);
        moveGhost("pink", 
                    (0 - ghostBodyPink.position.x) * ghostSpeed, 
                    (0 - ghostBodyPink.position.y) * ghostSpeed);
    }
    
    ///Generic function for moving ghosts
    function moveGhost(color, xtrans, ytrans)
    {
        switch(color)
        {
            case("red"):
                ghostHeadRed.position.x += xtrans;
                ghostBodyRed.position.x += xtrans;
                ghostHeadRed.position.y += ytrans;
                ghostBodyRed.position.y += ytrans;
                break;
            case("blue"):
                ghostHeadBlue.position.x += xtrans;
                ghostBodyBlue.position.x += xtrans;
                ghostHeadBlue.position.y += ytrans;
                ghostBodyBlue.position.y += ytrans;
                break;
            case("yellow"):
                ghostHeadYellow.position.x += xtrans;
                ghostBodyYellow.position.x += xtrans;
                ghostHeadYellow.position.y += ytrans;
                ghostBodyYellow.position.y += ytrans;
                break;
            case("pink"):
                ghostHeadPink.position.x += xtrans;
                ghostBodyPink.position.x += xtrans;
                ghostHeadPink.position.y += ytrans;
                ghostBodyPink.position.y += ytrans;
                break;
            default:
                break;
        }
    }

    ///Main game controls
    function controlCharacter()
    {   
        //Left strafe
        if(Key.isDown(Key.A))
		{
			
            strafeLeft();
            
		}
        //Right strafe
		else if(Key.isDown(Key.D))
		{
			
            strafeRight();
            
		}
        //Move forward, camera follow behind
		else if(Key.isDown(Key.W))
		{   
            moveForward();
            
		}
        //Move backward, camera follow in same position
		else if(Key.isDown(Key.S))
		{
			moveBackward();
            
		}
        /* Leftover movement controls from when turns were controlled with keys
            Decided on instant turn which could not be done with the provided code*/

        // var active = false;
        // //Left turn
        // if(active == true)
        // {
        //     if(playerDirectionX == 0)
        //     {
        //         playerDirectionX = 3;
        //     }
        //     else 
        //     {
        //         playerDirectionX--;
        //     }
        //     if(playerDirectionY == 0)
        //     {
        //         playerDirectionY = 3;
        //     }
        //     else
        //     {
        //         playerDirectionY--;
        //     }
            
        //     console.log('('+playerDirections[playerDirectionX]+','+playerDirections[playerDirectionY]+')');
        //     camera.position.x = character.position.x - 20 * playerDirections[playerDirectionX];
        //     camera.position.y = character.position.y - 20 * playerDirections[playerDirectionY];
        //     camera.lookAt(character.position);
        //     correctCameraRotation();
        //     //camera.rotation.x += (Math.PI/2) * playerDirections[playerDirectionX];
        //     //camera.rotation.y += (Math.PI/2) * playerDirections[playerDirectionY];
        // }

        // //Right turn
        // if(active == true)
        // {
        //     if(playerDirectionX == 3)
        //     {
        //         playerDirectionX = 0;
        //     }
        //     else 
        //     {
        //         playerDirectionX++;
        //     }
        //     if(playerDirectionY == 3)
        //     {
        //         playerDirectionY = 0;
        //     }
        //     else
        //     {
        //         playerDirectionY++;
        //     }
        //     console.log('('+playerDirections[playerDirectionX]+','+playerDirections[playerDirectionY]+')');
        //     camera.position.x = character.position.x - 20 * playerDirections[playerDirectionX];
        //     camera.position.y = character.position.y - 20 * playerDirections[playerDirectionY];
        //     camera.lookAt(character.position);
        //     correctCameraRotation();
        // }
    }


    ///Left turn, 90 degrees
    function turnLeft()
    {
        if(playerDirectionX == 0)
        {
            playerDirectionX = 3;
        }
        else 
        {
            playerDirectionX--;
        }
        if(playerDirectionY == 0)
        {
            playerDirectionY = 3;
        }
        else
        {
            playerDirectionY--;
        }
        
        console.log('('+playerDirections[playerDirectionX]+','+playerDirections[playerDirectionY]+')');
        camera.position.x = character.position.x - 20 * playerDirections[playerDirectionX];
        camera.position.y = character.position.y - 20 * playerDirections[playerDirectionY];
        camera.lookAt(character.position);
        correctCameraRotation();
        moveForward();
        //camera.rotation.x += (Math.PI/2) * playerDirections[playerDirectionX];
        //camera.rotation.y += (Math.PI/2) * playerDirections[playerDirectionY];
    }

    ///Right turn, 90 degrees
    function turnRight()
    {
        if(playerDirectionX == 3)
        {
            playerDirectionX = 0;
        }
        else 
        {
            playerDirectionX++;
        }
        if(playerDirectionY == 3)
        {
            playerDirectionY = 0;
        }
        else
        {
            playerDirectionY++;
        }
        console.log('('+playerDirections[playerDirectionX]+','+playerDirections[playerDirectionY]+')');
        camera.position.x = character.position.x - 20 * playerDirections[playerDirectionX];
        camera.position.y = character.position.y - 20 * playerDirections[playerDirectionY];
        camera.lookAt(character.position);
        correctCameraRotation();
        moveForward();
    }

    function moveForward()
    {
        character.position.x += playerDirections[playerDirectionX] * playerSpeed;
        character.position.y += playerDirections[playerDirectionY] * playerSpeed;
        camera.position.x = character.position.x - 20 * playerDirections[playerDirectionX];
        camera.position.y = character.position.y - 20 * playerDirections[playerDirectionY];
        //camera.lookAt(character.position);
        //correctCameraRotation();
    }

    function moveBackward()
    {
        character.position.x -= playerDirections[playerDirectionX] * playerSpeed;
        character.position.y -= playerDirections[playerDirectionY] * playerSpeed;
        camera.position.x = character.position.x - 20 * playerDirections[playerDirectionX];
        camera.position.y = character.position.y - 20 * playerDirections[playerDirectionY];
        //camera.lookAt(character.position);
        //correctCameraRotation();
    }
    
    function strafeLeft()
    {   
        if(playerDirections[playerDirectionX] == -1 || playerDirections[playerDirectionY] == -1)
        {
            character.position.x -= playerDirections[playerDirectionY] *playerStrafeSpeed;
            character.position.y += playerDirections[playerDirectionX] *playerStrafeSpeed;
        }
        else
        {
            character.position.x -= playerDirections[playerDirectionY] *playerStrafeSpeed;
            character.position.y += playerDirections[playerDirectionX] *playerStrafeSpeed;
        }

        camera.position.x = character.position.x - 20 * playerDirections[playerDirectionX];
        camera.position.y = character.position.y - 20 * playerDirections[playerDirectionY];
        //camera.position.x -= playerStrafeSpeed;
        //let orientation = playerDirectionX + playerDirectionY;
        //playerDirectionX = Math.cos((Math.PI) * playerDirectionX + Math.PI/2);
        //playerDirectionY = Math.sin((Math.PI) * playerDirectionY + Math.PI/2);
    }

    function strafeRight()
    {   
        if(playerDirections[playerDirectionX] == -1 || playerDirections[playerDirectionY] == -1)
        {
            character.position.x += playerDirections[playerDirectionY] *playerStrafeSpeed;
            character.position.y -= playerDirections[playerDirectionX] *playerStrafeSpeed;
        }
        else
        {
            character.position.x += playerDirections[playerDirectionY] *playerStrafeSpeed;
            character.position.y -= playerDirections[playerDirectionX] *playerStrafeSpeed;
        }

        camera.position.x = character.position.x - 20 * playerDirections[playerDirectionX];
        camera.position.y = character.position.y - 20 * playerDirections[playerDirectionY];
        //camera.position.x += playerStrafeSpeed;
        //let orientation = playerDirectionX + playerDirectionY;
        //playerDirectionX = Math.sin((Math.PI) * playerDirectionX - Math.PI/2);
        //playerDirectionY = Math.cos((Math.PI) * playerDirectionY - Math.PI/2);
    }

    /*
               (0,1)   PRAISE BE TO THE ALMIGHTY UNIT CIRCLE
               * | *             
            *    |    *       
    (-1,0) *_____|_____* (1,0)
           *     |     *      
            *    |    *        
               * | *             
               (0,-1)
    */

    ///Set camera rotation to correct setting based on player look direction
    function correctCameraRotation()
    {
        switch(playerDirections[playerDirectionX])
        {   
            // (1,0) - East
            case 1:
                camera.rotation.z = 3*Math.PI/2;
                break;
            // (-1,0) - West
            case -1:
                camera.rotation.z = -3*Math.PI/2;
                break;
            default:
                break;
        }

        switch(playerDirections[playerDirectionY])
        {   
            // (0,1) - North (default)
            case 1:
                break;
            // (0,-1) - South
            case -1:
                camera.rotation.z = Math.PI;
                break;
            default:
                break;
        }
    }

    ///Prevent player movement through walls. Not successfully implemented
    function preventPhasing()
    {
        //Convert player coords to location in maze array
        var gridY = Math.floor(character.position.x/20 + 10);
        var gridX = Math.floor(20 - (character.position.y/20 + 10));

        //Detect player entering a block containing a wall
        if(maze[gridX][gridY] == "#")
        {
            //moveBackward();
        }
    }

    //Detect collisions with pellets and adjust score
        //As of comment, breaks maze structure but not gameplay completely
    function detectPelletCollection()
    {   
        //Convert player coords to location in maze array
        var gridY = Math.floor(character.position.x/20 + 10);
        var gridX = Math.floor(20 - (character.position.y/20 + 10));

        if(maze[gridX][gridY] == "*") //&& pellets[gridX][gridY] != true)
        {   
            //Apparently you can't update a char in a string this way, dammit
            //maze[gridX][gridY] = "x";
            //console.log(maze[gridX][gridY]);

            /*Basically, instead of replacing a single character we have to pull out the whole line, 
            deconstruct the string around the character, and then build a new version of the line 
            with the new character*/
            var mazeRow = maze[gridX];
            if(gridY != 0 && gridY !=19)
            {
                var leftSide = mazeRow.substring(0,gridY-1);
                var rightSide = mazeRow.substring(gridY+1,19);
                var newRow = leftSide+"x"+rightSide;
            }
            else if(gridY == 19)
            {
                var leftSide = mazeRow.substring(0,gridY-1);
                var newRow = leftSide+"x";
            }
            else if(gridY == 0)
            {
                var rightSide = mazeRow.substring(gridY+1,19);
                var newRow = "x"+rightSide;
            }
            //removePellet(gridX, gridY);
            maze[gridX] = newRow;

            
            score += 5;
            if(soundEnabled == true)
            {
                pointAdd.play();
            }
            updateScoreDisplay();
            pelletsCount--;
            updatePelletsCounter();

        }
    }

    ///Remove pellet that has been collected from field, not working
    function removePellet(gridX, gridY)
    {   
        //pellets[gridX][gridY] = true;
        var pelletName = "Pellet"+((20-gridX-10)*20-10)+((gridY-10)*20+10);
        //console.log(pelletName);
        var pellet = scene.getObjectByName(pelletName);
        scene.remove(pellet);
        console.log(maze[gridX][gridY]);
    }

    ///Prevent player from leaving the play field
    function preventOutOfBounds()
    {
        if( character.position.x < -197)
        {
            character.position.x += 5;
        }
        else if(character.position.x > 197)
        {
            character.position.x -= 5;
        }
        else if(character.position.y > 197)
        {
            character.position.y -= 5;
        }
        else if(character.position.y < -197)
        {
            character.position.y += 5;
        }
    }


    ///Detect player collision with ghosts
    function detectGhostAttack()
    {
        if( (Math.abs(ghostBodyBlue.position.x - character.position.x)) < 4 &&
            (Math.abs(ghostBodyBlue.position.y - character.position.y)) < 4)
        {
            if(lives == 0)
            {
                gameEnded = true;
                displayEndScreen();
            }
            else{
                loseLife();
            }
        }
        if( (Math.abs(ghostBodyRed.position.x - character.position.x)) < 4 &&
            (Math.abs(ghostBodyRed.position.y - character.position.y)) < 4)
        {
            if(lives == 0)
            {
                gameEnded = true;
                displayEndScreen();
            }
            else{
                loseLife();
            }
        }
        if( (Math.abs(ghostBodyYellow.position.x - character.position.x)) < 4 &&
            (Math.abs(ghostBodyYellow.position.y - character.position.y)) < 4)
        {
            if(lives == 0)
            {
                gameEnded = true;
                displayEndScreen();
            }
            else{
                loseLife();
            }
        }
        if( (Math.abs(ghostBodyPink.position.x - character.position.x)) < 4 &&
            (Math.abs(ghostBodyPink.position.y - character.position.y)) < 4)
        {
            if(lives == 0)
            {
                gameEnded = true;
                displayEndScreen();
            }
            else{
                loseLife();
            }
        }
    }

    ///Penalize player for ghost collision and reset their position
    function loseLife()
    {   
        lives--;    //Decrement lives and update display
        updateLivesCounter();
        ooft.play();
        //owie.play();
        character.position.x = 0;   //Reset character to center
        character.position.y = 0;
        playerDirectionX = 0;   //Reset player direction
        playerDirectionY = 1;
        camera.position.x = character.position.x;   //Move camera back to original position
        camera.position.y = character.position.y - 20;
        camera.position.z = 10;
        camera.lookAt(character.position);
        if(score >= 50)
        {
            score -= 50;
        }
        else{
            score = 0;
        }
        updateScoreDisplay;

    }

    function displayEndScreen()
    {
        $("#endgame-modal").modal("open");
        $("#final-score").html(score);
        $("#pellets-eaten").html(240-pelletsCount);
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

    function loadSounds()
	{
		pointAdd = new Audio("sounds/pointadd.mp3");
        ooft = new Audio("sounds/ooft.mp3");
	}

    function loadMusic() 
	{
		defaultMusic = new Audio("sounds/default.mp3");
		defaultMusic.play();
		defaultMusic.loop = true;

	}

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

    ///Adds motivational 3D text
	function create3DText()
    {
		var textString = "Collect the pellets!";

		var textObjectGeometry = new THREE.TextGeometry(textString, {
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

	//window.onload = init;

    
    $(document).ready(function(){
        // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
        $('.modal').modal();
    });
          

