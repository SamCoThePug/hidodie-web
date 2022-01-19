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

    fully_loaded: false,
    map: {},
    map_loaded: {},
    map_img: {},
    map_frame: {},
    map_fps: {},
    map_loop: {},

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

    dashCooldown: false
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

let seeker_vision_img;