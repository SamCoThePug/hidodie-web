class Caught_Particle extends p5.Vector {
    constructor(x, y, color) {
        super(x, y);
        this.vel = p5.Vector.random2D();
        this.vel.mult(random(0.5, 2));
        this.acc = createVector(0, 0);
        this.r = 4;
        this.lifetime = 255;
        this.angle = random(TWO_PI);
        this.color = color;
    }
    
    finished() {
        return this.lifetime < 0;
    }
    
    applyForce(force) {
        this.acc.add(force);
    }
    
    update() {
        this.vel.add(this.acc);
        this.add(this.vel);
        this.acc.set(0, 0);
        
        this.lifetime -= 7;
    }
    
    show(youx, youy) {
        const { r, g, b } = hexToRgb(color_text[this.color]);

        noStroke();
        fill(color(r, g, b, this.lifetime));
        push();
        translate((this.x - youx + 627.5) * game.scale, (this.y - youy + 347.5) * game.scale);
        rotate(this.angle);
        square(0, 0, this.r * 2);
        pop();
    }
}

class Caught_Emitter {
    constructor(x, y, color) {
        this.position = createVector(x, y);
        this.particles = [new Caught_Particle(this.position.x, this.position.y, color)];
        
        for (let i = 0; i < 29; i++) 
            this.particles.push(new Caught_Particle(this.position.x, this.position.y, color));
    }
    
    applyForce(force) {
        for (let particle of this.particles) 
            particle.applyForce(force);
    }
    
    update() {
        for (let particle of this.particles) 
            particle.update();
        
        for (let i = this.particles.length - 1; i >= 0; i--) 
            if (this.particles[i].finished())
                this.particles.splice(i, 1);
    }
    
    show(x, y) {
        for (let particle of this.particles) 
            particle.show(x, y);
    }
}

function hexToRgb(hex) { // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

setInterval(() => {
    if (!particles || !particles.caught) return;
    for (let emitter of particles.caught) {
        if (!emitter || !emitter.particles || !emitter.particles.length) {
            particles.caught = particles.caught.slice(1);
        } else {
            emitter.update();
        }
    }
}, 1000 / 60);