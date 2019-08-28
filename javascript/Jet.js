class Jet extends PIXI.Sprite {
    constructor(parent) {
        super(resources["assets/spaceship.png"].texture);

        this.scale.set(0.15);
        this.anchor.set(0.5);
        this.vx = 0;
        this.score = 0;
        this.lostGame = false;

        this.health = 4;
        this.healthArray = [];

        this.parentContainer = parent;

        this.position.y = parent.screen.height - (this.height / 2);
        this.position.x = parent.screen.width / 2;

        this.missiles = [];

        this.shaking = false;
        this.speed = 0;
        this.damage = 1;
        this.continue = true;

        this.missileSound = new Howl({ src: ['assets/sounds/missileShort.mp3'] });
        this.explosion = new Howl({ src: ['assets/sounds/jetDamage.mp3'], volume: 0.2 });
        this.damageSound = new Howl({ src: ['assets/sounds/jetDamage.mp3'] });
        this.shootsound = new Howl({ src: ['assets/sounds/laser1.mp3'] });

        parent.stage.addChild(this);
    }

    restart() {
        this.health = 4;
        this.speed = 0;
        this.score = 0;
        this.damage = 1;
        this.updateHealth(0);
        this.x = app.view.width / 2;
        this.y = app.view.height - 75
        this.missiles = [];
    }

    updateSpeed(score) {
        this.speed = Math.floor(score / 10000);
        this.damage = Math.floor(score / 3000) + 1;
    }

    getHealth() {
        return this.health;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getVX() {
        return this.vx;
    }

    getMissiles() {
        return this.missiles;
    }

    animate(width) {
        if (this.x <= 10) {
            this.x = 10;
        }
        if (this.x >= width - 10) {
            this.x = width - 10;
        }
        this.x += this.vx;
        this.x = this.x;
    }

    move(vx) {
        this.vx = vx;
    }

    stop() {
        this.vx = 0;
    }

    animateHealth() {
        if (this.continue) {
            let yPos = 25;
            let xPos = (window.innerWidth / 2) + 40;

            this.healthArray.forEach(e => {
                e.removeSelf();
            })

            this.healthArray = [];

            for (let i = 0; i < this.health; i++) {
                if (i % 6 === 0 && i !== 0) {
                    yPos += 30;
                    xPos -= 180;
                }
                let healthSprite = new Sprite(resources['assets/heart.png'].texture);
                healthSprite.removeSelf = () => {
                    app.stage.removeChild(healthSprite);
                }
                healthSprite.scale.set(0.04, 0.04);
                healthSprite.position.set(xPos + i * 30, yPos);
                this.healthArray.push(healthSprite);
                app.stage.addChild(healthSprite);
            }
        } else return
    }

    updateHealth(amount) {
        this.health += amount;
        const health = document.getElementById("health");

        let removeItem = (array) => {
            if (array.length >= 1) {
                array[array.length - 1].removeSelf();
                array.pop();
                this.continue = true;
            }
        }

        if (amount < 0) {
            if (this.health >= 1) {
                TweenMax.to(this.healthArray[this.health], 1, { y: -50, ease: Power2.easeOut, onStart: this.continue = false, onComplete: removeItem, onCompleteParams: [this.healthArray, this.health] })
            } else {
                removeItem(this.healthArray);
            }
        }

        TweenLite.to(health, 1, { scale: 1.5, ease: Power4.easeOut });
        TweenLite.to(health, 1, { scale: 1, ease: Power4.easeOut, delay: 0.1 });
    }

    shoot() {
        this.shootsound.play();
        shootBullet("assets/bullet.png", this, this.damage)
        for (let i = 1; i <= this.speed; i++) {
            setTimeout(() => {shootBullet("assets/bullet.png", this, this.damage); this.shootsound.play()}, 300 / (i * 2));
            if (this.speed >= 2) {
                this.missileSound.play();
                setTimeout(() => shootBullet("assets/missile.png", this, this.damage, 'left'), 300 / i * 2);
                setTimeout(() => shootBullet("assets/missile.png", this, this.damage, 'right'), 300 / i * 2);
            }
        }
    }
}