router.paths.play.load = () => {
    router.paths.play.unload(undefined, true);
    document.getElementById("join_basics").style.display = "block";

    if (document.body.style.backgroundImage.length !== background) document.body.style.backgroundImage = "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)), url(https://real2two.github.io/hidodie-maps/beta_vibes/blurred.png)";

    document.getElementById("room_buttons").innerHTML = join_query_id ? `<button id="join_room_from_id_button" onclick="joinRoomCode(join_query_id);" class="theme_primary_color">Join</button>` : `<button onclick="joinRoom(true)" class="theme_primary_color">Quick Join</button> <button onclick="playSetupContinue()" class="theme_color">Create Room</button>`;

    if (game.logged_in) {
        document.getElementById("username").value = game.logged_in;
    } else {
        document.getElementById("username").value = getCookie("username");
    }
    
    const colorSelect = document.getElementById("color");

    for (let i, j = 0; i = colorSelect.options[j]; j++) 
        if (i.value == getCookie("color")) 
            colorSelect.selectedIndex = j;

    const classSelect = document.getElementById("join_class");
    
    for (let i, j = 0; i = classSelect.options[j]; j++) 
        if (i.value == getCookie("class")) 
            classSelect.selectedIndex = j;

    if (game.logged_in) document.getElementById("create_debug_option").style.display = "block";
}

router.paths.play.unload = (path, dontdopath) => {
    document.getElementById("join_basics").style.display = "none";
    document.getElementById("join_chooseroom").style.display = "none";
    document.getElementById("game-container").style.display = "none";
    document.getElementById("join").style.display = "block";
    document.getElementById("status_box").style.display = "none";
    document.getElementById("status_box").innerHTML = "";
    document.getElementById("chat").style.display = "none";
    document.getElementById("settings").style.display = "none";
    document.getElementById("map_info").style.display = "none";
    document.getElementById("game_loading").style.display = "none";

    game.room = null;
    game.dashCooldown = false;
    game.fully_loaded = false;
    game.map_loaded = {};
    game.map_img = {};
    game.map_frame = {};
    game.messages = [];
    if (game.map_loop.background) clearInterval(game.map_loop.background);
    if (game.map_loop.foreground) clearInterval(game.map_loop.foreground);
    if (game.sounds.before) game.sounds.before.stop();
    if (game.sounds.game) game.sounds.game.stop();

    game.players = {};
    interpolated_pos = {};
    
    if (!dontdopath && path !== "index") document.body.style.backgroundImage = "none";

    if (p5_loaded && fullscreen()) fullscreen(false);
}

/* */

function saveColorAndClass() {
    setCookie("color", document.getElementById("color").value, 365);
    setCookie("class", document.getElementById("join_class").value, 365);
}

function sendError(m) {
    Swal.fire({
        icon: 'error',
        title: m
    });

    return false;
}

function checkIfGood(creating_room, modify_settings) {
    if (!modify_settings) {
        let u = document.getElementById("username").value;
        if (u.length == 0) return sendError("Your username cannot be empty.");
        if (u.length > 11) return sendError("Your username cannot be over 11 characters.");
        if (u.replace(/[0-9a-zA-Z]/g, "").length > 0) return sendError("A username can only consist of letters and numbers.");
        
        if (!creating_room) return true;
    }

    let t = parseFloat(document.getElementById(modify_settings ? "modify_choosetimer" : "create_choosetimer").value);

    if (t !== Math.round(t)) return sendError("The number of seconds on how long the game lasts must be rounded to the nearest whole number.");
    if (t < 30) return sendError("The game must last at least 30 seconds.");
    if (t > 600) return sendError("The game must last less than 600 seconds.");

    let s = parseFloat(document.getElementById(modify_settings ? "modify_seekers" : "create_seekers").value);

    if (s !== Math.round(s)) return sendError("You can't have decimal of seekers ingame.");
    if (s < 1) return sendError("There must be at least 1 seeker.");
    if (s > 3) return sendError("There cannot be over 3 seekers.");

    let m = document.getElementById(modify_settings ? "modify_mapid" : "create_mapid").value;

    if (m.replace(/[0-9a-zA-Z]/g, "").replace(/_/g, "").length > 0) return sendError("A map ID can only contain numbers, letters, and underscores.");

    return true;
}

function createRoom() {
    if (!p5_loaded_check) return;
    if (!checkIfGood(true)) return;

    saveColorAndClass();

    //wsSend({
    //    a: "create_room",
    //    u: document.getElementById("username").value,
    //    c: chosenColor(),
    //    z: chooseClass(),
    //    p: document.getElementById("create_ispublic").checked,
    //    t: parseFloat(document.getElementById("create_choosetimer").value),
    //    m: document.getElementById("create_mapid").value,
    //    d: document.getElementById("create_debug").checked,
    //    s: parseFloat(document.getElementById("create_seekers").value)
    //});

    game.connecting = true;

    sendWS(`0${document.getElementById("create_ispublic").checked ? 1 : 0}${parseFloat(document.getElementById("create_seekers").value)}${parseFloat(document.getElementById("create_choosetimer").value)},${document.getElementById("create_mapid").value || "random"},${chosenColor()}${chooseClass()}${document.getElementById("username").value}`)
}

function joinRoom(quick) {
    if (game.connecting) return;
    if (!p5_loaded_check) return;
    if (!checkIfGood()) return;
    
    saveColorAndClass();

    /*
    wsSend({
        a: quick ? "quick_join" : "join_room",
        u: document.getElementById("username").value,
        c: chosenColor(), 
        z: chooseClass(),
        r: quick ? undefined : document.getElementById("code").value
    });
    */

    game.connecting = true;
    
    if (quick) {
        sendWS(`2${chosenColor()}${chooseClass()}${document.getElementById("username").value}`);
    } else {
        sendWS(`1${document.getElementById("code").value}${chosenColor()}${chooseClass()}${document.getElementById("username").value}`);
    }

}

function joinRoomCode(code) {
    if (game.connecting) return;
    if (!p5_loaded_check) return;
    if (!checkIfGood()) return;
    
    saveColorAndClass();

    /*
    wsSend({
        a: "join_room",
        u: document.getElementById("username").value,
        c: chosenColor(),
        z: chooseClass(),
        r: code
    });
    */
    
    game.connecting = true;

    sendWS(`1${code}${chosenColor()}${chooseClass()}${document.getElementById("username").value}`);
}

function chosenColor() {
    return document.getElementById("color").value == "random" ? Math.round(random(9)) : parseFloat(document.getElementById("color").value);
}

function startGame() {
    sendWS(`5`);
}

const classes = ["stamina", "dash"];

function chooseClass(modify) {
    return document.getElementById(modify ? "modify_class" : "join_class").value == "random" ? classes.indexOf(random(classes)) : classes.indexOf(document.getElementById(modify ? "modify_class" : "join_class").value);
}

function playSetupContinue() {
    document.getElementById("join_basics").style.display = "none";
    document.getElementById("join_chooseroom").style.display = "block";
}

function playSetupBack() {
    document.getElementById("join_chooseroom").style.display = "none";
    document.getElementById("join_basics").style.display = "block";
}

function copyPlayLink() {
    navigator.clipboard.writeText(`${location.protocol}//${document.location.hostname}/play?room=${game.room}`);

    Swal.fire({
        icon: 'success',
        title: 'Copied the link to your clipboard!',
        timer: 5000,
        timerProgressBar: true
    });
}