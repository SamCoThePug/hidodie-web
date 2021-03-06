const MEMBER = 0,
      SPECTATOR = 1,
      HIDER = 2,
      SEEKER = 3;

const BORDER = 0,
    SPEED_BOOSTER = 1,
    TELEPORTER = 2,
    HIDING_SPOT = 3,
    INVISIBILITY_SPOT = 4,
    VISIBILITY_SPOT = 5;

let game = {
    room: null,
    host: null,
    public: false,

    started: false,
    timer: null,

    connecting: false,

    fully_loaded: false,
    map: {},
    map_loaded: {},
    map_img: {},
    map_frame: {},
    map_fps: {},
    map_loop: {},
    hiders_vision_img: null,
    volume: 1,

    players: {},
    interpolated_pos: {},

    seeker_count: {},
    
    logged_in: null,
    username: null,
    movement: {
        x: 2,
        y: 2
    },
    typing: false,

    messages: [],

    scale: 1,

    sounds: {
        before: null,
        game: null
    },

    abilityInterval: null,
    abilityCooldown: false
};

let particles = {
    caught: [],
    teleported: []
}

let touch = {
    ing: false,
    og: {
        x: 0,
        y: 0
    },
    x: 0,
    y: 0
}

const color_text = [
    "19FFFF",
    "3F51B5",
    "7C4A00",
    "7E7E7E",
    "4CAF50",
    "FF9800",
    "CC56CC",
    "8B32C2",
    "F44336",
    "FFEB3B"
]
const color_images = {};

let hiders_vision_img;

function preload() {
    hiders_vision_img = loadImage("/assets/img/hiders_vision.png");

    let i = 0;
    let colors = ["aqua", "blue", "brown", "gray", "green", "orange", "pink", "purple", "red", "yellow"];
    for (const color of colors) {
        color_images[i] = loadImage(`/assets/img/players/${color}.png`);
        i++;
    }
}

function setup() {
    p5_loaded = true;
    for (let i = 0; i < 11; i++)
        addPercentLoading();

    setInterval(() => {
        let movers = document.getElementsByClassName("home_move");
        for (let move of movers) {
            move.style.marginLeft = Math.sin(millis() * 0.001) * 10;
            move.style.marginTop = Math.sin(millis() * 0.005) * 5;
            move.style.transform = `rotate(${Math.sin(millis() * 0.001) * 0.01}rad)`;
        }
    }, 1);
    
    createCanvas(1280, 720)
        .parent("game-container");
    
    windowResized();

    smooth();
}

async function windowResized() { // https://riptutorial.com/html5-canvas/example/19169/scaling-image-to-fit-or-fill-
    game.scale = Math.min(windowWidth / 1280, windowHeight / 720);
      
    resizeCanvas(1280 * game.scale, 720 * game.scale);
    fixChat();
  
    delete game.hiders_vision_img;

    let img_width = hiders_vision_img.width * game.scale;
    let img_height = hiders_vision_img.height * game.scale;
    game.hiders_vision_img = createImage(img_width, img_height);
    game.hiders_vision_img.copy(hiders_vision_img, 0, 0, hiders_vision_img.width, hiders_vision_img.height, 0, 0, img_width, img_height);

    delete game.map_loaded.background;
    delete game.map_loaded.foreground;
    
    if (game.map_img.original_background) {
      let img_width = game.map_img.original_background.width * game.scale;
      let img_height = game.map_img.original_background.height * game.scale;
  
      let total_frames = game.map_fps.background ? game.map_img.original_background.numFrames() : 1;
  
      game.map_img.background = {};
  
      if (game.map_fps.background) {
          for (let i = 0; i < total_frames; i++) {
                game.map_img.background[i] = createImage(img_width, img_height);
                game.map_img.original_background.setFrame(i);
                game.map_img.background[i].copy(game.map_img.original_background, 0, 0, game.map_img.original_background.width, game.map_img.original_background.height, 0, 0, img_width, img_height);
          }
      } else {
            game.map_img.background[0] = createImage(img_width, img_height);
            game.map_img.background[0].copy(game.map_img.original_background, 0, 0, game.map_img.original_background.width, game.map_img.original_background.height, 0, 0, img_width, img_height);
      }
  
      game.map_loaded.background = true;
    }
  
    if (game.map_img.original_foreground) {
      let img_width = game.map_img.original_foreground.width * game.scale;
      let img_height = game.map_img.original_foreground.height * game.scale;
  
      let total_frames = game.map_fps.foreground ? game.map_img.original_foreground.numFrames() : 1;
  
      game.map_img.foreground = {};
  
      if (game.map_fps.foreground) {
          for (let i = 0; i < total_frames; i++) {
                game.map_img.foreground[i] = createImage(img_width, img_height);
                game.map_img.original_foreground.setFrame(i);
                game.map_img.foreground[i].copy(game.map_img.original_foreground, 0, 0, game.map_img.original_foreground.width, game.map_img.original_foreground.height, 0, 0, img_width, img_height);
          }
      } else {
            game.map_img.foreground[0] = createImage(img_width, img_height);
            game.map_img.foreground[0].copy(game.map_img.original_foreground, 0, 0, game.map_img.original_foreground.width, game.map_img.original_foreground.height, 0, 0, img_width, img_height);
      }
  
      game.map_loaded.foreground = true;
    }
  }