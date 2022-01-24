function keyPressed() {
    if (keyCode == ENTER) {
        if (document.activeElement === document.getElementById("message")) {
            game.typing = false;
            sendMessage(document.getElementById("message").value);
            document.getElementById("message").value = "";
            document.getElementById("message").focus();
            document.getElementById("message").blur();
            typing = false;
        } else {
            document.getElementById("message").focus();
            document.getElementById("message").select();
        }
    }

    if (game.room && keyCode == ESCAPE) 
        openSettings();
}

function sendMessage(content) {
    if (content.length !== 0) sendWS(`3${content}`);
}

function doChat(content, command_type) {
    let c = parseHTML(content);
    switch (command_type) {
        case 0: // gray text
            game.messages.push(`<span style="color:#505050">${c}</span>`);
            break;
        case 1: // error
            game.messages.push(`<span style="color:#720000">${c}</span>`);
            break;
        case 2: // success
            game.messages.push(`<span style="color:#00461D">${c}</span>`);
            break;
        default: // white text
            game.messages.push(c);
            break;
    }
    game.messages = game.messages.slice(-9);

    document.getElementById("messages").innerHTML = game.messages.join("<br>");
    fixChat();
}

function parseHTML(html) {
    return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function fixChat() {
    const chat_div = document.getElementById("chat");
    const settings_div = document.getElementById("settings");
    const map_info_div = document.getElementById("map_info");

    if (!canvas) return;
    if (document.getElementById("game-container").style.display == "none") {
        if (chat_div) {
            chat_div.style.top = null;
            chat_div.style.left = `30px`;
            chat_div.style.bottom = `30px`;
        }
    
        if (settings_div) {
            settings_div.style.left = null;
            settings_div.style.right = `50px`;
            settings_div.style.top = `50px`;
        }
    
        if (map_info_div) 
            map_info_div.style.right = `50px`
    } else {
        if (chat_div) {
            chat_div.style.bottom = null;
            chat_div.style.left = `${canvas.getBoundingClientRect().left + 30}px`;
            chat_div.style.top = `${canvas.getBoundingClientRect().bottom - chat_div.getBoundingClientRect().height}px`;
        }
    
        if (settings_div) {
            settings_div.style.right = null;
            settings_div.style.left = `${canvas.getBoundingClientRect().right - 50}px`;
            settings_div.style.top = `${canvas.getBoundingClientRect().top + 30}px`;
        }
    
        if (map_info_div) 
            map_info_div.style.right = `${canvas.getBoundingClientRect().left + 30}px`;
    }
}