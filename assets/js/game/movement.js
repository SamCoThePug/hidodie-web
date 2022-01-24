function doubleClicked() {
    if (!game.room) return;
    if (game.players[game.username].class == "dash" && !game.abilityCooldown) sendWS(`2`);
}

function touchStarted(event) {
    if (!game.room) return;
    if (!event.touches || !event.touches[0]) return;

    touch.ing = true;

    touch.og.x = event.touches[0].clientX;
    touch.og.y = event.touches[0].clientY;

    touch.x = touch.og.x;
    touch.y = touch.og.y;
}
  
function touchMoved(event) {
    if (!game.room) return;
    if (!event.touches || !event.touches[0]) return;
    if (!touch.ing) return;

    let x = event.touches[0].clientX;
    let y = event.touches[0].clientY;

    let new_movement = { x: 2, y: 2 };
    new_movement.x = touch.og.x < x ? 1 : 0;
    new_movement.y = touch.og.y < y ? 1 : 0;

    updateMovement(new_movement);
    
    touch.x = x;
    touch.y = y;
}
  
function touchEnded() {
    if (!game.room) return;
    if (!touch.ing) return;

    touch.ing = false;

    updateMovement({ x: 2, y: 2 });
}

function updateMovement(new_movement) {
    if (!game.room) return;

    if (game.movement.x !== new_movement.x || game.movement.y !== new_movement.y) {
        sendWS(`1${new_movement.x}${new_movement.y}`);

        game.movement = new_movement;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState == "hidden") updateMovement({ x: 2, y: 2 });
});

function getMousePos() { // https://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
    const rect = canvas.getBoundingClientRect();

    return {
        og: {
            x: touch.og.x - rect.left,
            y: touch.og.y - rect.top
        },

        x: touch.x - rect.left,
        y: touch.y - rect.top
    };
}

document.addEventListener('keydown', logKey);
document.addEventListener('keyup', unlogKey);

let holding = [];

function logKey(e) {
    holding[e.code] = true;
}

function unlogKey(e) {
    delete holding[e.code];
}

function handleMovement() {
    if (game.players[game.username].class == "dash" && !game.abilityCooldown && !game.typing && holding[getControl('ability', 'Space')]) sendWS(`2`);

    if (!game.typing && !touch.ing) {
        let new_movement = { x: 2, y: 2 };

        if (holding[getControl('up', 'KeyW')] || holding[getControl('down', 'KeyS')]) {
            if (!(holding[getControl('up', 'KeyW')] && holding[getControl('down', 'KeyS')])) {
                if (holding[getControl('up', 'KeyW')]) {
                    new_movement.y = 0;
                } else {
                    new_movement.y = 1;
                }
            } else {
                new_movement.y = 2;
            }
        } else {
            new_movement.y = 2;
        }
    
        if (holding[getControl('left', 'KeyA')] || holding[getControl('right', 'KeyD')]) {
            if (!(holding[getControl('left', 'KeyA')] && holding[getControl('right', 'KeyD')])) {
                if (holding[getControl('left', 'KeyA')]) {
                    new_movement.x = 0;
                } else {
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
}