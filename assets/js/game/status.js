function setStatusBox() {
    let status_box = document.getElementById("status_box");

    const you = game.players[game.username];

    if (!game.started) {
        if (Object.entries(game.players).length >= game.seeker_count + 1) {
            if (game.host == game.username) {
                status_box.innerHTML = `<button onmouseup="startGame()" ontouchstart="startGame()">Start Game</button>${game.abilityCooldown || you.teleporting ? "<br>" : ""}<br>Invite players: <a href="#" onclick="copyPlayLink()">${location.protocol}//${document.location.hostname}/play?region=${encodeURIComponent(WS_HOST)}&room=${game.room}</a>${game.abilityCooldown ? `<br>Ability cooldown: <b>${Math.round((game.abilityCooldown - Date.now()) / 100) / 10}</b> seconds left.` : ""}${you.teleporting ? `<br>You will be teleported in <b>${Math.ceil(you.teleporting / 1000)}</b> seconds.` : ""}`;
            } else {
                status_box.innerHTML = `Waiting for host to start the game...<br>Invite players: <a href="#" onclick="copyPlayLink()">${location.protocol}//${document.location.hostname}/play?region=${encodeURIComponent(WS_HOST)}&room=${game.room}</a>${game.abilityCooldown ? `<br>Ability cooldown: <b>${Math.round((game.abilityCooldown - Date.now()) / 100) / 10}</b> seconds left.` : ""}${you.teleporting ? `<br>You will be teleported in <b>${Math.ceil(you.teleporting / 1000)}</b> seconds.` : ""}`;
            }
        } else {
            status_box.innerHTML = `Waiting for players to join...<br>Invite players: <a href="#" onclick="copyPlayLink()">${location.protocol}//${document.location.hostname}/play?region=${encodeURIComponent(WS_HOST)}&room=${game.room}</a>${game.abilityCooldown ? `<br>Ability cooldown: <b>${Math.round((game.abilityCooldown - Date.now()) / 100) / 10}</b> seconds left.` : ""}${you.teleporting ? `<br>You will be teleported in <b>${Math.ceil(you.teleporting / 1000)}</b> seconds.` : ""}`;
        }
    } else {
        const you = game.players[game.username];
        switch(you.role) {
            case HIDER:
                status_box.innerHTML = `You are a <b>hider</b>.<br>Hide as far as you can from the seeker!<br>Timer: <b>${Math.ceil(game.timer / 1000)}</b> seconds left.${game.abilityCooldown ? `<br>Ability cooldown: <b>${Math.round((game.abilityCooldown - Date.now()) / 100) / 10}</b> seconds left.` : ""}${you.teleporting ? `<br>You will be teleported in <b>${Math.ceil(you.teleporting / 1000)}</b> seconds.` : ""}`;
                break;
            case SEEKER:
                const hiders_left = Object.entries(game.players).filter(([u,p]) => p.role == HIDER).length;
                if (you.stun) {
                    let stun_left = Math.round(you.stun / 10) / 100;
                    switch (stun_left.toString().length) {
                        case 1:
                            stun_left += ".00";
                            break;
                        case 3:
                            stun_left += "0";
                            break;
                    } 
                    status_box.innerHTML = `You are a <b>seeker</b>.<br>There ${hiders_left == 1 ? "is": "are"} <b>${hiders_left}</b> hider${hiders_left == 1 ? "": "s"} left!<br>You just caught someone! You must wait for <b>${stun_left}</b> more seconds to move again.<br>${Math.ceil(game.timer / 1000) <= 30 ? "<b>" : ""}Timer: <b>${Math.ceil(game.timer / 1000)}</b> seconds left.${Math.ceil(game.timer / 1000) <= 30 ? "</b>" : ""}${game.abilityCooldown ? `<br>Ability cooldown: <b>${Math.round((game.abilityCooldown - Date.now()) / 100) / 10}</b> seconds left.` : ""}${you.teleporting ? `<br>You will be teleported in <b>${Math.ceil(you.teleporting / 1000)}</b> seconds.` : ""}`;
                } else {
                    status_box.innerHTML = `You are a <b>seeker</b>.<br>There ${hiders_left == 1 ? "is": "are"} <b>${hiders_left}</b> hider${hiders_left == 1 ? "": "s"} left!<br>Catch all the hiders before the timer runs out!<br>${Math.ceil(game.timer / 1000) <= 30 ? "<b>" : ""}Timer: <b>${Math.ceil(game.timer / 1000)}</b> seconds left.${Math.ceil(game.timer / 1000) <= 30 ? "</b>" : ""}${game.abilityCooldown ? `<br>Ability cooldown: <b>${Math.round((game.abilityCooldown - Date.now()) / 100) / 10}</b> seconds left.` : ""}${you.teleporting ? `<br>You will be teleported in <b>${Math.ceil(you.teleporting / 1000)}</b> seconds.` : ""}`;
                }

                break;
            case SPECTATOR:
                status_box.innerHTML = `You are a <b>spectator</b>.<br>You can glide around, but don't spoil where everyone is! It ruins the game.<br>Timer: <b>${Math.ceil(game.timer / 1000)}</b> seconds left.`;
                break;
            default:
                status_box.innerHTML = "Loading...";
                break;
        }
    }
}