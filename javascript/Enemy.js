class Enemy {
    constructor(amount, health, speed, movement, enemiesPos, speedMin, speedMax, bulletSize, height, width) {
        this.amount = amount;
        this.health = health;
        this.speed = speed;
        this.vx = movement;
        this.vy = movement / 2;
        this.bulletSize = bulletSize;
        this.missiles = [];
        this.enemies = [];
        this.startingPos = enemiesPos;
        this.enemiesPos = enemiesPos;
        this.positioned = false;
        this.speedMin = speedMin;
        this.speedMax = speedMax;
        this.height = height;
        this.width = width;
        this.healthbarWidth = 0;
        this.startSpawn = true;
        this.spawnSound = new Howl({ src: ['assets/sounds/coming.mp3'] });
        this.animateSound = new Howl({ src: [`assets/sounds/${this.amount > 1 ? 'ship.flac' : 'chime.mp3'}`] });
        this.interval;
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    getEnemiesPos() {
        return this.enemiesPos;
    }

    reduceEnemiesPos(amount) {
        this.enemiesPos -= amount;
        if (this.enemiesPos <= 0) {
            this.positioned = false;
        }
    }

    getMissiles() {
        return this.missiles;
    }

    getEnemies() {
        return this.enemies;
    }

    setShouldSpawn(bool) {
        this.startSpawn = bool;
    }

    getShouldSpawn() {
        return this.startSpawn;
    }

    restart(health) {
        this.missiles = [];
        this.enemies = [];
        this.health = health;
    }

    spawn(level) {
        this.animateSound.play();
        this.interval = setInterval(() => { this.animateSound.play() }, this.amount > 1 ? 180000 : 4000);
        this.spawnSound.play();
        let enemyY = -260;
        let enemyX = 10;

        let enemyTexture = level;
        if (level > 11) {
            enemyTexture = level -= 10;
        }

        for (let i = 1; i <= this.amount; i++) {
            let enemy = new Sprite(resources[`assets/enemy${enemyTexture}.png`].texture);
            enemy.scale.set(0.2, 0.2);
            enemy.anchor.set(0.5, 0.5);
            enemyX = i * 80;
            if (i > 11) {
                enemyY = -180;
                enemyX = (i - 11) * 80;
            }
            if (i > 22) {
                enemyY = -100;
                enemyX = (i - 22) * 80;
            }
            enemy.position.set(enemyX + 20, enemyY)
            enemy.health = this.health;

            enemy.healthbar = new Sprite(resources["assets/healthbar2.png"].texture);
            enemy.healthbar.scale.set(this.width / 250, this.width / 250);
            this.healthbarWidth = enemy.healthbar.width * 2;
            app.stage.addChild(enemy.healthbar);

            enemy.vx = this.speed
            enemy.vy = this.speed;

            enemy.shoot = () => {
                let bullet = new Sprite(resources["assets/enemyBullet.png"].texture);
                bullet.anchor.set(0.5, 1);
                bullet.position.x = enemy.position.x;
                bullet.position.y = enemy.position.y + 30;
                bullet.scale.set(this.bulletSize, this.bulletSize);

                bullet.vy = this.speed;

                bullet.zIndex = 2;

                bullet.removeSelf = () => {
                    app.stage.removeChild(bullet);
                }

                this.missiles.push(bullet);
                app.stage.addChild(bullet);
                app.stage.updateLayersOrder();
            }

            enemy.removeSelf = () => {
                app.stage.removeChild(enemy);
                app.stage.removeChild(enemy.healthbar);
            }

            this.enemies.push(enemy);
            app.stage.addChild(enemy);
        }
        this.enemiesPos = this.startingPos;
        this.health *= 2;
        this.positioned = true;
    }

    animate(jet, bg, level) {
        if (this.enemies.length <= 0) {
            this.animateSound.stop()
            clearInterval(this.interval);
        }
        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];

            if (jet.shouldStartShaking() === true) {
                jet.shake();
                bg.position.x += randomInt(-1, 1);
                bg.position.y += randomInt(-1, 1);
            }

            if (e.health <= 0) {
                e.removeSelf();
                addScore(100)
                jet.updateSpeed(score);
                this.enemies.splice(i, 1);
            }

            if (level === 6 || level === 16) {
                e.rotation += 0.03;
            }


            e.healthbar.position.set(this.amount === 1 ? e.x - 130 : e.x - 35, e.y + this.height / 2);

            TweenMax.to(e.healthbar, 1, { width: this.healthbarWidth * (e.health / this.health), ease: Power2.easeOut })

            if (e.position.x >= app.view.width - this.width) {
                this.vx = -this.speed;
            }

            if (e.position.x < this.width) {
                this.vx = this.speed;
            }
            e.position.x += this.vx;

            if (e.position.y >= app.view.height / 2) {
                this.vy = -this.speed / 4;
            }

            if (e.position.y < this.height) {
                this.vy = this.speed / 4;
            }

            e.position.y += this.vy;

            if (e.shake === true) {

            }
        }
    }

    shoot(jet) {
        if (this.positioned) {
            this.enemies.forEach(e => {
                e.position.y += 3;
            })
            this.reduceEnemiesPos(3);
        }

        for (let i = 0; i < this.missiles.length; i++) {
            let m = this.missiles[i];

            m.vy += 0.2;
            m.y += m.vy;

            if (m.position.y > app.view.height + 50) {
                m.removeSelf();
                this.missiles.splice(i, 1)
            }

            if (m.position.y > app.view.height - 150 && m.position.x > jet.getX() - 80 && m.position.x < jet.getX() + 80) {
                m.removeSelf();
                const explosionTextures = [];
                let j;

                for (j = 0; j < 26; j++) {
                    const texture = PIXI.Texture.from(`Explosion_Sequence_A ${j + 1}.png`);
                    explosionTextures.push(texture);
                }

                const explosion = new PIXI.AnimatedSprite(explosionTextures);
                explosion.scale.set(0.8, 0.8)
                explosion.position.set(m.x - 60, m.y)
                explosion.gotoAndPlay(1);
                explosion.removeSelf = () => {
                    app.stage.removeChild(explosion);
                }
                setTimeout(() => { explosion.stop(); explosion.removeSelf() }, 400)
                app.stage.addChild(explosion);
                this.missiles.splice(i, 1);
                jet.updateHealth(-1);
                jet.damageSound.play();
                jet.startShaking();
                jet.stopShaking();
            }
        }
    }
}