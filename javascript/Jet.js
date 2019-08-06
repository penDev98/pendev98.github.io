class Jet {
    constructor(x, y, scale, health, texture) {
        this.texture = new Sprite(resources[texture].texture);
        this.texture.anchor.set(0.5, 0.5);
        this.texture.position.set(x, y);
        this.texture.scale.set(scale, scale);
        this.x = this.texture.x;
        this.y = this.texture.y;
        this.health = health;
        this.healthArray = [];
        this.vx = 0;
        this.vy = 0;
        this.missiles = [];
        this.shaking = false;
        this.speed = 0;
    }

    restart() {
        this.updateHealth(4);
        this.x = app.view.width / 2;
        this.y = app.view.height - 75
        this.missiles = [];
    }

    addToStage() {
        app.stage.addChild(this.texture);
    }

    shouldStartShaking() {
        return this.shaking;
    }

    startShaking() {
        this.shaking = true;
    }

    shake() {
        this.texture.position.x += randomInt(-1, 1);
    }

    stopShaking() {
        setTimeout(() => this.shaking = false, 200)
    }

    updateSpeed(score) {
        this.speed = Math.floor(score / (2000 * (this.speed + 1)));
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
        if (this.texture.x <= 10) {
            this.texture.x = 10;
        }
        if (this.texture.x >= width - 10) {
            this.texture.x = width - 10;
        }
        this.texture.x += this.vx;
        this.x = this.texture.x;
    }

    move(vx) {
        this.vx = vx;
    }

    stop() {
        this.vx = 0;
    }

    animateHealth() {
        let yPos = 20;
        let xPos = (window.innerWidth / 2) + 40;

        this.healthArray.forEach(e => {
            e.removeSelf();
        })

        this.healthArray = [];

        for (let i = 0; i < this.health; i++) {
            if (i % 6 === 0 && i !== 0) {
                yPos += 60;
                xPos -= 240;
            }
            let healthSprite = new Sprite(resources['assets/spaceship.png'].texture);
            healthSprite.removeSelf = () => {
                app.stage.removeChild(healthSprite);
            }
            healthSprite.scale.set(0.04, 0.04);
            healthSprite.position.set(xPos + i * 40, yPos);
            this.healthArray.push(healthSprite);
            app.stage.addChild(healthSprite);
        }
    }

    updateHealth(amount) {
        this.health += amount;
        const health = document.getElementById("health");

        if (amount < 0) {
            this.healthArray[this.health].removeSelf();
            this.healthArray.pop();
        }

        TweenLite.to(health, 1, { scale: 1.5, ease: Power4.easeOut });
        TweenLite.to(health, 1, { scale: 1, ease: Power4.easeOut, delay: 0.1 });
    }

    shoot() {
        this.shootBullet()
        for (let i = 1; i <= this.speed; i++) {
            setTimeout(() => this.shootBullet(), 300 / (i * 2));
            if (this.speed >= 2) {
                this.shootMissile();
                setTimeout(() => this.shootMissile(), 300 / i * 2);
            }
        }
    }

    shootBullet() {
        let bullet = new Sprite(resources["assets/bullet.png"].texture);
        bullet.rotation = 3.15;
        bullet.anchor.set(0.5, 0);
        bullet.scale.set(0.06, 0.06);
        bullet.vy = 20;
        bullet.zIndex = 2;
        bullet.position.y = app.view.height - 100;
        bullet.position.x = this.x;

        app.stage.addChild(bullet);
        bullet.removeSelf = () => {
            app.stage.removeChild(bullet);
        }

        this.missiles.push(bullet);
        app.stage.updateLayersOrder();
    }

    shootMissile() {
        let missile1 = new Sprite(resources["assets/missile.png"].texture);
        let missile2 = new Sprite(resources["assets/missile.png"].texture);
        missile1.anchor.set(0.5, 0);
        missile1.scale.set(0.06, 0.06);
        missile2.anchor.set(0.5, 0);
        missile2.scale.set(0.06, 0.06);

        missile1.vy = 10;
        missile2.vy = 10;

        missile1.zIndex = 2;
        missile2.zIndex = 2;

        missile1.position.y = app.view.height - 30;
        missile2.position.y = app.view.height - 30;

        app.stage.addChild(missile1, missile2);
        missile1.position.x = this.texture.position.x - 45;
        missile2.position.x = this.texture.position.x + 45;

        missile1.removeSelf = () => {
            app.stage.removeChild(missile1);
        }

        missile2.removeSelf = () => {
            app.stage.removeChild(missile2);
        }

        this.missiles.push(missile1);
        this.missiles.push(missile2);
        app.stage.updateLayersOrder();
    }

    shooting(enemy) {
        for (let i = 0; i < this.missiles.length; i++) {
            let m = this.missiles[i];

            if (m.position.y > app.view.height - 100) {
                if (i % 2 !== 0) {
                    m.position.x = this.x - 45;
                }
                else m.position.x = this.x + 45;
            }

            m.vy += 0.2;
            m.y -= m.vy;

            if (m.position.y < -100) {
                addScore(-10)
                this.updateSpeed(score);
                this.missiles[i].removeSelf();
                this.missiles.splice(i, 1);
            }

            for (let j = 0; j < enemy.getEnemies().length; j++) {
                const e = enemy.getEnemies()[j];

                if (m.position.y < e.position.y - enemy.getHeight() && m.position.x > e.position.x - enemy.getWidth() && m.position.x < e.position.x + enemy.getWidth()) {
                    try {
                        this.missiles[i].removeSelf();
                    } catch (e) {
                        console.log(e);
                    }
                    this.missiles.splice(i, 1);

                    enemy.getEnemies()[j].health--;
                    addScore(10);
                    this.updateSpeed(score);
                    enemy.getEnemies()[j].shake = true;
                    stopShaking(enemy.getEnemies()[j]);
                }
            }
        }
    }
}