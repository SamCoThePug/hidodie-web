function draw() {
    clear();

    if (!game.room) return;

    let you = game.players[game.username];
    if (!you) return;

    const player_pos = {};
    
    for (let [username, info] of Object.entries(game.players))
        player_pos[username] = currentPos(username);

    const you_pos = player_pos[game.username];

    if (!game.fully_loaded || game.fully_loaded == 1) {
        if (
            (
                game.map.images.foreground && game.map.images.foreground.img ? 
                game.map_loaded.original_foreground :
                true
            ) &&
            (
                game.map.images.background && game.map.images.background.img ? 
                game.map_loaded.original_background :
                true
            )
        ) {
            if (
                (
                    game.map.images.foreground && game.map.images.foreground.img ? 
                    game.map_loaded.foreground && game.map_img.original_foreground :
                    true
                ) &&
                (
                    game.map.images.background && game.map.images.background.img ? 
                    game.map_loaded.background && game.map_img.original_background :
                    true
                )
            ) {
                game.fully_loaded = true;
            } else {
                if (game.fully_loaded !== 1) {
                    game.fully_loaded = 1;
                    windowResized();
                }
            }
        } else {
            push();
            translate(width / 2, height / 2);
            textAlign(CENTER);
            fill("#FFFFFF");
            textSize(16);
            text("Loading...", 0, 0);
            pop();
        }
    }

    if (!game.fully_loaded) return;

    if (game.players[game.username].class == "dash" && !game.dashCooldown && !game.typing && keyIsDown(32)) wsSend({ a: "dash" });

    if (!game.typing && !touch.ing) {
        let new_movement = { x: 2, y: 2 };

        if (keyIsDown(87) || keyIsDown(83)) { // 87 = w | 83 = s
            if (!(keyIsDown(87) && keyIsDown(83))) {
                if (keyIsDown(87)) {
                    new_movement.y = 0;
                } else { // keyIsDown(83)
                    new_movement.y = 1;
                }
            } else {
                new_movement.y = 2;
            }
        } else {
            new_movement.y = 2;
        }
    
        if (keyIsDown(65) || keyIsDown(68)) { // a = 65 | d = 68
            if (!(keyIsDown(65) && keyIsDown(68))) {
                if (keyIsDown(65)) {
                    new_movement.x = 0;
                } else { // keyIsDown(68)
                    new_movement.x = 1;
                }
            } else {
                new_movement.x = 2;
            }
        } else {
            new_movement.x = 2;
        }

        updateMovement(new_movement);
    }

    if (game.map_img.background) image(game.map_img.background[game.map_frame.background], (627.5 - you_pos.x) * game.scale, (347.5 - you_pos.y) * game.scale);

    const current_c = currentCollusion(you);

    let loop_usernames = [];

    for (let [username, info] of Object.entries(game.players)) {
        if (info.role !== SPECTATOR) {
            let visible = false;
            if (you.role == SPECTATOR) {
                visible = true;
            } else {
                const theirc = currentCollusion(info);

                if (current_c.type == INVISIBILITY_SPOT) {
                    if (theirc.i == current_c.i || [null, VISIBILITY_SPOT].includes(theirc.type)) {
                      visible = true;
                    }
                  } else {
                    if (!current_c.type)
                      if ([null, VISIBILITY_SPOT].includes(theirc.type))
                        visible = true;
          
                    if (theirc.type == HIDING_SPOT)
                      if (theirc.i == current_c.i)
                        visible = true;
          
                    if (theirc.type == VISIBILITY_SPOT)
                      if (theirc.i == current_c.i)
                        visible = true;
                  }
            }

            if (visible == true) {
                push();

                const px = (player_pos[username].x - you_pos.x + 627.5) * game.scale,
                      py = (player_pos[username].y - you_pos.y + 347.5) * game.scale

                translate(px, py);

                loop_usernames.push([ username, px, py, info ]); //
                image(color_images[info.color], 0, 0, 25 * game.scale, 25 * game.scale);

                if (info !== you && you.role == SPECTATOR) {
                    noStroke();
                    fill("#FF0000");
                    rect(0, 30 * game.scale, 25 * game.scale, 5 * game.scale);

                    let transparency = info.stamina * 2 / 100;
                    fill(info.stamina < 50 ? `rgba(255,255,0,${transparency < .6 ? .6 : transparency})` : "#FFFF00");
                    rect(0, 30 * game.scale, (info.stamina / 4) * game.scale, 4.5 * game.scale);

                    strokeWeight(.75 * game.scale);
                    stroke(0);
                    noFill();
                    rect(0, 30 * game.scale, 25 * game.scale, 5 * game.scale);
                    noStroke();
                }

                pop();
            }
        }
    }

    for (let [ username, px, py, info ] of loop_usernames) {
        push();
        
        translate(px, py);

        let color;

        switch (info.role) {
            case MEMBER:
                color = `#${color_text[info.color]}`;
                break;
            case HIDER:
                color = `#FFFFFF`;
                break;
            case SEEKER:
                color = `#FF0000`;
                break;
        }

        fill(color);
        determineUsernamePlacing(username);

        pop();
    }
    
    if (you.role !== SPECTATOR) {
        if (!current_c.type || (current_c.type ? (current_c.type == INVISIBILITY_SPOT) : current_c.type)) {
            for (const collusion of game.map.zones.filter(c => [HIDING_SPOT, INVISIBILITY_SPOT, VISIBILITY_SPOT].includes(c.type) && current_c.actual !== c && checkZone(c))) {
                push();
                translate((collusion.location[0] - you_pos.x + 627.5) * game.scale, (collusion.location[1] - you_pos.y + 347.5) * game.scale);
                fill("rgba(0,0,0,0.5)");
                rect(0, 0, (collusion.location[2] - collusion.location[0]) * game.scale, (collusion.location[3] - collusion.location[1]) * game.scale);
                pop();
            }
        }

        if (typeof you.stamina == "number") {
            push();
            translate(627.5 * game.scale, 347.5 * game.scale);

            noStroke();
            fill("#FF0000");
            rect(0, 30 * game.scale, 25 * game.scale, 5 * game.scale);

            let transparency = you.stamina * 2 / 100;
            fill(you.stamina < 50 ? `rgba(255,255,0,${transparency < .6 ? .6 : transparency})` : "#FFFF00");
            rect(0, 30 * game.scale, (you.stamina / 4) * game.scale, 4.5 * game.scale);

            strokeWeight(.75 * game.scale);
            stroke(0);
            noFill();
            rect(0, 30 * game.scale, 25 * game.scale, 5 * game.scale);
            noStroke();

            pop();
        }
    }

    for (let emitter of particles.caught) 
        if (emitter && emitter.particles && emitter.particles.length) 
            emitter.show(you_pos.x, you_pos.y);


    for (let emitter of particles.teleported) 
        emitter.show(you_pos.x, you_pos.y);

    if (game.map_img.foreground) image(game.map_img.foreground[game.map_frame.foreground], (627.5 - you_pos.x) * game.scale, (347.5 - you_pos.y) * game.scale);

    if (you.role !== SPECTATOR) {
        let i = 0;

        fill("black");

        for (const collusion of game.map.zones.filter(c => [HIDING_SPOT, INVISIBILITY_SPOT, VISIBILITY_SPOT].includes(c.type) && checkZone(c))) {
            if (collusion.type == INVISIBILITY_SPOT) {
                i++;
                continue;
            }
            
            push();
            let c_x = (collusion.location[0] - you_pos.x + 627.5) * game.scale;
            let c_y = (collusion.location[1] - you_pos.y + 347.5) * game.scale;
            let c_x_length = (collusion.location[2] - collusion.location[0]) * game.scale;
            let c_y_length = (collusion.location[3] - collusion.location[1]) * game.scale;

            if (current_c && i == current_c.i) {
                rect(0, 0, width, c_y);
                rect(0, c_y + c_y_length, width, height);
                rect(0, 0, c_x, height);
                rect(c_x_length + c_x, 0, width, height);
            }

            pop();

            i++;
        }
    }

    if (game.players[game.username] && game.players[game.username].role == SEEKER) image(game.seeker_vision_img, 0, 0);
    
    noStroke();
    fill("#FFFFFF");
    text(`FPS: ${Math.round(getFrameRate())}\nPing: ${latency ? `${latency}ms` : "???"}`, 10, 20);
    //text(`FPS: ${Math.round(getFrameRate())}\nPing: ${latency}ms\nRoom: ${game.room}\nHost: ${game.host.startsWith("[Guest] ") ? game.host.slice("[Guest] ".length) : game.host}\nVisibility: ${game.public ? "Public" : "Private"}\nMap ID: ${game.map.id}\nSeekers: ${game.seeker_count}\nGame Length: ${game.game_length / 1000} seconds`, 10, 20);

    if (touch.ing) {
        const mouse_pos = getMousePos();

        fill("rgba(101,101,101,0.6)");
        circle(mouse_pos.og.x - 2, mouse_pos.og.y - 2, 50);
        
        fill(`rgb(58,58,58)`);
        circle(mouse_pos.x, mouse_pos.y, 20);
    }

    if (game.dashCooldown) setStatusBox();
    
    function currentCollusion(player) {
        let i = 0;
    
        for (const collusion of game.map.zones.filter(c => [HIDING_SPOT, INVISIBILITY_SPOT, VISIBILITY_SPOT].includes(c.type) && checkZone(c))) {
            if (
                player.pos.x + 25 >= collusion.location[0] &&
                player.pos.x <= collusion.location[2] &&
                player.pos.y + 25 >= collusion.location[1] &&
                player.pos.y <= collusion.location[3]
            )
                return {
                    type: collusion.type,
                    actual: collusion,
                    i: i
                };
            i++;
        }
    
        return {
            type: null,
            i: -1
        }
    }

    function checkZone(zone) {
        if (zone.at) {
            if (!game.started || !game.timer) return false;

            let totestwith = 60000 - game.timer;

            if (zone.at.type == 1) totestwith = totestwith % zone.at.remainder; // LOOP

            if (totestwith < zone.at.start || totestwith > zone.at.end) return false;

            return true;
        }

        return true;
    }
}

window.onbeforeunload = () => {
    if (game.room) return '';
};

function currentPos(player) {
    let interpolated = game.interpolated_pos[player];
    if (!interpolated) return game.players[player].pos;
    if (interpolated.length > 0) game.interpolated_pos[player].shift();
    return interpolated[0] || game.players[player].pos;
}