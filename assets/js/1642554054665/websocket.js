const WS_HOST = "testing-hidodie.noiq.io";
const MAP_STORAGE = "https://real2two.github.io/hidodie-maps";

"use strict";

let ws;
let latency;
let connection_timeout;
let connected = false;
connectionQueue();

function connect() {
    let timeout_interval = Date.now();
    ws = new WebSocket(`ws${document.location.protocol == "https:" ? "s" : ""}://${WS_HOST}/api/connect`);

    ws.onopen = async() => {
        connected = true;

        console.log("[WEBSOCKET] Connected!");

        wsSend({ a: "connected" });

        ws.onmessage = async evt => {
            timeout_interval = Date.now();

            const data = JSON.parse(evt.data);
            if (data.a !== "timer" && data.a !== "bunk") console.log(data);

            switch(data.a) {
                case "ping":
                    wsSend({ a: "ping" });

                    if (data.f) {
                        if (data.u) game.logged_in = data.u;

                        let path = document.location.pathname.slice(1);
                        if (path == "loading" || path == "disconnected") path = "index";
                        if (join_query_id && path !== "play") join_query_id = undefined;
                        router.load(path || "index", true);
                    }

                    break;
                case "pong":
                    latency = data.l;
                    break;
                case "timer":
                    game.timer = data.t;

                    setStatusBox();
                    break;
                case "bunk":
                    let old_players = game.players;

                    game.players = data.p;
                    game.timer = data.t;

                    for (let [u, i] of Object.entries(game.players)) {
                        let old_p = old_players[u];

                        if (old_p) {
                            let old_pos = old_p.pos;
                            let new_pos = i.pos;

                            if (old_pos.x !== new_pos.x || old_pos.y !== new_pos.y) {
                                if (!game.interpolated_pos[u]) game.interpolated_pos[u] = [];

                                let setup = { x: new_pos.x, y: new_pos.y };

                                if (old_pos.x !== new_pos.x) {
                                    let difference = old_pos.x + new_pos.x;
                                    difference /= 2;

                                    setup.x = difference;
                                }
    
                                if (old_pos.y !== new_pos.y) {
                                    let difference = old_pos.y + new_pos.y;
                                    difference /= 2;

                                    setup.y = difference;
                                }

                                game.interpolated_pos[u].push(setup);
                                game.interpolated_pos[u].push({ x: new_pos.x, y: new_pos.y });

                                let amount_to_keep = -Math.round(frameRate()) / 10;
                                game.interpolated_pos[u] = game.interpolated_pos[u].slice(amount_to_keep < 4 ? 4 : amount_to_keep);
                            }
                        }
                    }

                    setStatusBox();
                    break;
                case "error":
                    if (game.room && data.m == "You aren't in a game.") return game.room = null;

                    Swal.fire({
                        icon: 'error',
                        title: data.m
                    });

                    if (join_query_id) {
                        if (["A player with the provided username is already on the room.", "Your username cannot be empty.", "Your username cannot be over 11 characters.", "A username can only consist of letters and numbers.", "Illegal username. Choose another username.", "The game already started. (has a synced map)"].includes(data.m)) return playSetupBack();

                        join_query_id = undefined;
                    }

                    break;
                case "dashed":
                    if (game.dashInterval) clearTimeout(game.dashInterval);

                    let dash_length = typeof data.l == "number" ? data.l : 5000;

                    // If data.l exists, it's not a user done dash.

                    game.dashCooldown = Date.now() + dash_length;
                    game.dashInterval = setTimeout(() => {
                        game.dashCooldown = false;
                        setStatusBox();
                    }, dash_length);
                    break;
                case "particles-teleported":
                    particles.teleported.push(new Teleportation_Effect(data.x, data.y, game.players[data.p].color));
                    break;
                case "particles-caught":
                    particles.caught.push(new Caught_Emitter(data.x, data.y, game.players[data.p].color));
                    break;
                case "message":
                    doChat(`${data.u.startsWith("[Guest] ") ? data.u.slice("[Guest] ".length) : data.u}: ${data.c}`);
                    break;
                case "player_join":
                    doChat(`${data.u.startsWith("[Guest] ") ? data.u.slice("[Guest] ".length) : data.u} joined the room.`);
                    break;
                case "player_left":
                    delete game.interpolated_pos[data.u];
                    doChat(`${data.u.startsWith("[Guest] ") ? data.u.slice("[Guest] ".length) : data.u} left the room.`);
                    break;
                case "game_loading":
                    document.getElementById("game-container").style.display = "none";
                    document.getElementById("status_box").style.display = "none";
                    document.getElementById("game_loading").style.display = "block";

                    wsSend({ a: "ping", s: true });
                    break;
                case "game_start":
                    document.getElementById("game_loading").style.display = "none";
                    document.getElementById("game-container").style.display = "block";
                    document.getElementById("status_box").style.display = "block";

                    if (game.sounds.before) game.sounds.before.stop();
                    if (game.sounds.game && game.map.sounds.game) {
                        game.sounds.game.loop();

                        if (game.map.synced.enabled) {
                            setTimeout(() => {
                                if (!game.started) return;
                                
                                let currentTime = game.sounds.game.elt.currentTime;
                                const audioDelay = Math.abs(.1 - currentTime);
    
                                if (currentTime > 0.99 && currentTime < 1.01) return console.log("Audio delay (good): " + audioDelay);
     
                                if (currentTime < .1) {
                                    console.log("Audio delay (behind): " + audioDelay);
                                    game.sounds.game.elt.currentTime += audioDelay * 2;
                                } else {
                                    console.log("Audio delay (after): " + audioDelay);
                                    setTimeout(() => {
                                        game.sounds.game.elt.currentTime -= audioDelay;
                                    }, audioDelay);
                                }
                            }, 100);
                        }
                    }

                    game.map_frame.background = 0;
                    game.map_frame.foreground = 0;
                    Swal.close();
                    game.started = true;
                    break;
                case "game_end":
                    document.getElementById("game_loading").style.display = "none";
                    document.getElementById("game-container").style.display = "block";
                    document.getElementById("status_box").style.display = "block";

                    if (game.sounds.before && game.map.sounds.before) game.sounds.before.loop();
                    if (game.sounds.game) game.sounds.game.stop();
                    game.map_frame.background = 0;
                    game.map_frame.foreground = 0;

                    game.started = false;
                    game.timer = null;
                    
                    switch (data.w) {
                        case SEEKER:
                            Swal.fire({
                                title: "Seekers have won!",
                                confirmButtonText: "Close"
                            });
                            break;
                        case HIDER:
                            Swal.fire({
                                title: "Hiders have won!",
                                confirmButtonText: "Close"
                            });
                            break;
                    }
                    break;
                case "toggle_public":
                    game.public = data.p;
                    break;
                case "set_map":
                    game.map = data.m;
                    if (game.host == game.username) openSettings();
                    setupMap();
                    break;
                case "set_timer":
                    game.game_length = data.t;
                    break;
                case "set_seekers":
                    game.seeker_count = data.s;
                    setStatusBox();
                    break;
                case "new_host":
                    game.host = data.h;
                    break;
                case "leave_room":
                    router.load("index");
                    break;
                case "join_room":
                    join_query_id = undefined;
                    
                    document.body.style.backgroundImage = "none";
                    document.getElementById("status_box").style.display = "block";
                    
                    if (!fullscreen()) fullscreen(true);

                    setCookie("username", data.u.startsWith("[Guest] ") ? data.u.slice("[Guest] ".length) : data.u, 365);

                    game.room = data.r;
                    game.username = data.u;
                    game.host = data.h;
                    game.started = data.s;
                    game.public = data.p;
                    game.map = data.m;
                    game.game_length = data.t;
                    game.seeker_count = data.c;

                    document.getElementById("join").style.display = "none";
                    document.getElementById("game-container").style.display = "block";
                    document.getElementById("chat").style.display = "block";
                    document.getElementById("settings").style.display = "block";

                    const map_info = document.getElementById("map_info");
                    map_info.innerHTML = `<b>${game.map.name}</b> by ${game.map.author.link ? `<a href="${game.map.author.link}">` : ""}${game.map.author.username}${game.map.author.link ? `</a>` : ""}`;
                    map_info.style.display = "block";

                    setupMap();

                    break;
            }
        }
    }

    ws.onclose = () => {
        console.log("[WEBSOCKET] Disconnected.");
        restartConnection();
    }

    ws.onerror = evt => {
        console.log("[WEBSOCKET] An error has occured on the WebSocket connection.");
        console.log(evt);
        ws.close();
        restartConnection();
    }

    let timeout_loop = setInterval(() => {
        if (Date.now() > timeout_interval + 30000) {
            ws.close();
            restartConnection();
        }
    }, 1000);

    async function restartConnection() {
        connected = false;
        
        connection_timeout = Date.now();
        clearInterval(timeout_loop);
        ws = null;

        Swal.close();

        await router.load("disconnected", true);

        console.log("[WEBSOCKET] Reconnection queued.");
        connectionQueue();
    }
}

function connectionQueue() {
    if (ws) return console.log(`[WEBSOCKET] Something unexpected happened. connectionQueue() ran when the socket was already connected.`);

    if (!connection_timeout || Date.now() > connection_timeout + 5000) {
        console.log("[WEBSOCKET] Connecting...")
        connection_timeout = Date.now();
        connect();
    } else {
        setTimeout(() => {
            if (!ws) connectionQueue();
        }, connection_timeout + 5000 - Date.now());
    }
}

function wsSend(content) {
    ws.send(JSON.stringify(content));
}

async function setupMap() {
    game.map_loaded = {};

    if (game.sounds.before) game.sounds.before.remove();
    if (game.sounds.game) game.sounds.game.remove();

    game.map_img = {};
    if (game.map_loop.background) clearInterval(game.map_loop.background);
    if (game.map_loop.foreground) clearInterval(game.map_loop.foreground);
    game.map_frame = {};

    if (game.map.sounds.before && game.map.sounds.before.sound) {
        if (game.map.sounds.before && game.map.sounds.before) {
            game.sounds.before = createAudio(`${MAP_STORAGE}/${game.map.id}/${game.map.sounds.before.sound}`);
            game.sounds.before.volume(game.map.sounds.before.volume);
            game.sounds.before.loop();
        }
    }

    if (game.map.sounds.game && game.map.sounds.game.sound) {
        if (game.map.sounds.game) {
            game.sounds.game = createAudio(`${MAP_STORAGE}/${game.map.id}/${game.map.sounds.game.sound}`);
            game.sounds.game.volume(game.map.sounds.game.volume);
        }
    }

    if (game.map.images.background && game.map.images.background.img) {
        loadImage(`${MAP_STORAGE}/${game.map.id}/${game.map.images.background.img}`, img => {
            game.map_img.original_background = img;
            game.map_loaded.original_background = true;
        });
        
        game.map_fps.background = game.map.images.background.fps;
        game.map_frame.background = 0;

        if (game.map_fps.background) {
            game.map_loop.background = setInterval(() => {
                if (!game.room) return clearInterval(game.map_loop.background);
                if (!game.map_loaded.original_background) return;
                if (game.map_loaded.original_foreground)
                    if (!game.map_loaded.foreground) return;

                game.map_frame.background++;
                if (game.map_frame.background == game.map_img.original_background.numFrames()) game.map_frame.background = 0;
            }, 1000 / game.map_fps.background);
        }
    }

    if (game.map.images.foreground && game.map.images.foreground.img) {
        loadImage(`${MAP_STORAGE}/${game.map.id}/${game.map.images.foreground.img}`, img => {
            game.map_img.original_foreground = img;
            game.map_loaded.original_foreground = true;
        });
        game.map_fps.foreground = game.map.images.foreground.fps;
        game.map_frame.foreground = 0;

        if (game.map_fps.foreground) {
            game.map_loop.foreground = setInterval(() => {
                if (!game.room) return clearInterval(game.map_loop.foreground);
                if (!game.map_loaded.original_foreground) return;
                if (game.map_loaded.original_background)
                    if (!game.map_loaded.background) return;

                game.map_frame.foreground++;
                if (game.map_frame.foreground == game.map_img.original_foreground.numFrames()) game.map_frame.foreground = 0;
            }, 1000 / game.map_fps.foreground);
        }
    }
}