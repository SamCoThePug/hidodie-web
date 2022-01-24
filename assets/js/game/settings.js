let volume_slider_interval;

function openSettings() {
    let volume_text = `Volume: <input type="range" id="volume" min="0" max="100" value="${game.volume * 100}" onchange="game.volume = Math.floor(this.value / 10) / 10; changeVolume(determineVolume());"><br>`

    let class_text = `Class: ` +
        `<select id="modify_class" class="input light_input" onchange="changeClass()">` +
            `<option value="stamina"${game.players[game.username].class == "stamina" ? " selected" : ""}>Stamina</option>` +
            `<option value="dash"${game.players[game.username].class == "dash" ? " selected" : ""}>Dash</option>` +
        `</select>`;

    let controls_text = `<button class="input light_input" onclick="openControls()">Change Controls</button><br>`

    let host_text = 
        `<br><br>Public: <input class="input" type="checkbox" onclick="togglePublic();" id="modify_ispublic"${game.public ? " checked" : ""}><br>` +
        `Map: <input class="input light_input" id="modify_mapid" onblur="setMap();" value="${game.map.id}"><br>` +
        `Seekers: <input type="number" class="input light_input" id="modify_seekers" onblur="setSeekers();" min="1" max="3" value="${game.seeker_count}"><br>` +
        `Timer: ${
            game.map.synced.enabled ?
            `<input class="input light_input" value="${game.map.synced.duration / 1000}" disabled>` :
            `<input type="number" class="input light_input" id="modify_choosetimer" onblur="setTimer();" min="30" max="600" value="${game.game_length / 1000}">`
        } seconds`;
    
    let sound_text = [];

    if (game.map.sounds.before || game.map.sounds.game) {
        if (game.map.sounds.before) {
            let extra = "";
            if (game.map.sounds.before.credit.extra_text) extra = `<br><code>${game.map.sounds.before.credit.extra_text.replace(/\n/g, "<br>")}</code><br>`;

            if (game.map.sounds.before.credit.link) {
                sound_text.push(`Before game starts music: <a href="${game.map.sounds.before.credit.link}" class="light_link">${game.map.sounds.before.credit.text}</a>${extra}`);
            } else {
                sound_text.push(`Before game starts music: ${game.map.sounds.before.credit.text}${extra}`);
            }
        }
    
        if (game.map.sounds.game) {
            let extra = "";
            if (game.map.sounds.game.credit.extra_text) extra = `<br><code>${game.map.sounds.game.credit.extra_text.replace(/\n/g, "<br>")}</code>${extra}<br>`;

            if (game.map.sounds.game.credit.link) {
                sound_text.push(`Game music: <a href="${game.map.sounds.game.credit.link}" class="light_link">${game.map.sounds.game.credit.text}</a>${extra}`);
            } else {
                sound_text.push(`Game music: ${game.map.sounds.game.credit.text}`);
            }
        }
    }

    sound_text = sound_text.join("<br>");
    sound_text += "<br><br>";

    Swal.fire({
        title: "Settings",
        html: `Currently, there ${Object.entries(game.players).length == 1 ? "is" : "are"} <b>${Object.entries(game.players).length}</b> player${Object.entries(game.players).length == 1 ? "" : "s"} in this room.<br><br>${sound_text}${volume_text}${controls_text}${game.started ? "" : (game.host == game.username ? `${class_text}${host_text}<br><br>` : class_text)}`,
        confirmButtonText: "Close",
        showDenyButton: true,
        denyButtonText: `Leave`,
        didOpen: () => { // causes earrape sometimes.
            /*
            let volume = document.getElementById("volume");
            
            volume_slider_interval = setInterval(() => {
                if (volume.value / 100 == game.volume) return;
                game.volume = Math.floor(volume.value / 10) / 10;
                changeVolume(determineVolume());
            }, 100);
            */
        },
        onClose: () => {
            clearInterval(volume_slider_interval);
        }
    }).then((result) => {
        if (result.isDenied) 
            ws.close();
    });
}

function openControls() {
    Swal.fire({
        title: "Settings - Controls",
        html:
            `<h3>Movement</h3>` +
            `Up: <input id="controls-up" value="${getControlHTML('up', 'KeyW')}" onkeydown="setControls('up', event.code); event.preventDefault();"><br>` + 
            `Left: <input id="controls-left" value="${getControlHTML('left', 'KeyA')}" onkeydown="setControls('left', event.code); event.preventDefault();"><br>` +
            `Down: <input id="controls-down" value="${getControlHTML('down', 'KeyS')}" onkeydown="setControls('down', event.code); event.preventDefault();"><br>` +
            `Right: <input id="controls-right" value="${getControlHTML('right', 'KeyD')}" onkeydown="setControls('right', event.code); event.preventDefault();">` +

            `<h3>Ability</h3>` +
            `Use: <input id="controls-ability" value="${getControlHTML('ability', 'Space')}" onkeydown="setControls('ability', event.code); event.preventDefault();">`
        ,
        confirmButtonText: "Back",
    }).then(() => {
        openSettings();
    });
}

function getControl(which, defaultv) {
    return getCookie(`controls-${which}`) || defaultv;
}

function getControlHTML(which, defaultv) {
    return parseHTML(getControl(which, defaultv));
}

function setControls(which, key) {
    setCookie(`controls-${which}`, key, 365);

    if (document.getElementById(`controls-${which}`)) document.getElementById(`controls-${which}`).value = key;
}

function togglePublic() {
    sendWS(`6`);
}

function setTimer() {
    if (!checkIfGood(false, true)) return;
    sendWS(`9${parseFloat(document.getElementById("modify_choosetimer").value)}`);
}

function setMap() {
    if (!checkIfGood(false, true)) return;
    sendWS(`7${document.getElementById("modify_mapid").value}`);
}

function setSeekers() {
    if (!checkIfGood(false, true)) return;
    sendWS(`8${parseFloat(document.getElementById("modify_seekers").value)}`);
}

function changeClass() {
    sendWS(`4${chooseClass(true)}`);
}