class Teleportation_Effect extends p5.Vector {
    constructor(x, y, color) {
        super(x, y);
        this.frameCount = 3;
        this.color = color;
        this.random = [
            -random(-2, 10),
            -random(-2, 10),
            -random(-2, 10)
        ];
        this.random2 = [
            -random(-5, 1),
            -random(-5, 1),
            -random(-5, 1)
        ];
    }
    
    show(youx, youy) {
        const { r, g, b } = hexToRgb(color_text[this.color]);

        noStroke();

        let frame = this.frameCount / 2;

        push();
        translate((this.x - youx + 627.5) * game.scale, (this.y - youy + 347.5) * game.scale);
        fill(color(r, g, b, 255 - frame ** 2));
        let y_length = 25 + (frame ** 1.5);
        rect(2 * game.scale, (-y_length - (frame ** 2) - this.random[0]) * game.scale, (10 - (frame * 1.5)) * game.scale, (y_length - this.random2[0]) * game.scale);
        rect(9 * game.scale, (-y_length - (frame ** 2) - this.random[1]) * game.scale, (10 - (frame * 1.5)) * game.scale, (y_length - this.random2[1]) * game.scale);
        rect(16 * game.scale, (-y_length - (frame ** 2) - this.random[2]) * game.scale, (10 - (frame * 1.5)) * game.scale, (y_length - this.random2[2]) * game.scale);
        pop();
    }
}

setInterval(() => {
    for (let emitter of particles.teleported) {
        if (!emitter || emitter.frameCount >= 10) {
            particles.teleported = particles.teleported.slice(1);
        } else {
            if (this.frameCount < 7) emitter.frameCount++; 
            emitter.frameCount++;
        }
    }
}, 1000 / 24);