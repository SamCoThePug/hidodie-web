function openSettings() {
    let class_text = `Class: ` +
        `<select id="modify_class" class="light_input" onchange="changeClass()">` +
            `<option value="stamina"${game.players[game.username].class == "stamina" ? " selected" : ""}>Stamina</option>` +
            `<option value="dash"${game.players[game.username].class == "dash" ? " selected" : ""}>Dash</option>` +
        `</select>`;

    let host_text = 
        `<br><br>Public: <input type="checkbox" onclick="togglePublic();" id="modify_ispublic"${game.public ? " checked" : ""}><br>` +
        `Map: <input class="light_input" id="modify_mapid" onblur="setMap();" value="${game.map.id}"><br>` +
        `Seekers: <input type="number" class="light_input" id="modify_seekers" onblur="setSeekers();" min="1" max="3" value="${game.seeker_count}"><br>` +
        `Timer: ${
            game.map.synced.enabled ?
            `<input class="light_input" value="${game.map.synced.duration / 1000}" disabled>` :
            `<input type="number" class="light_input" id="modify_choosetimer" onblur="setTimer();" min="30" max="600" value="${game.game_length / 1000}">`
        } seconds`;
    
    let sound_text = [];

    if (game.map.sounds.before || game.map.sounds.game) {
        if (game.map.sounds.before) {
            if (game.map.sounds.before.credit.link) {
                sound_text.push(`Before game starts music: <a href="${game.map.sounds.before.credit.link}" class="light_link">${game.map.sounds.before.credit.text}</a>`);
            } else {
                sound_text.push(`Before game starts music: ${game.map.sounds.before.credit.text}`);
            }
        }
    
        if (game.map.sounds.game) {
            if (game.map.sounds.game.credit.link) {
                sound_text.push(`Game music: <a href="${game.map.sounds.game.credit.link}" class="light_link">${game.map.sounds.game.credit.text}</a>`);
            } else {
                sound_text.push(`Game music: ${game.map.sounds.game.credit.text}`);
            }
        }
    }

    sound_text = sound_text.join("<br>");
    sound_text += "<br><br>";

    Swal.fire({
        title: "Settings",
        html: `Currently, there ${Object.entries(game.players).length == 1 ? "is" : "are"} <b>${Object.entries(game.players).length}</b> player${Object.entries(game.players).length == 1 ? "" : "s"} in this room.<br><br>${sound_text}${game.started ? "" : (game.host == game.username ? `${class_text}${host_text}<br><br>` : class_text)}`,
        confirmButtonText: "Close",
        showDenyButton: true,
        denyButtonText: `Leave`
    }).then((result) => {
        if (result.isDenied) 
            wsSend({ a: "leave_room" });
    });
}

function togglePublic() {
    wsSend({ a: "toggle_public" });
}

function setTimer() {
    wsSend({ a: "set_timer", t: parseFloat(document.getElementById("modify_choosetimer").value) });
}

function setMap() {
    wsSend({ a: "set_map", m: document.getElementById("modify_mapid").value });
}

function setSeekers() {
    wsSend({ a: "set_seekers", s: parseFloat(document.getElementById("modify_seekers").value) });
}

function changeClass() {
    wsSend({ a: "change_class", z: document.getElementById("modify_class").value });
}