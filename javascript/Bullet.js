class Bullet extends PIXI.Sprite {
    constructor(parent, texture, jet, side, addBullet) {
        super(texture)

        this.addBullet = addBullet
        this.anchor.set(0.5, 0);
        this.scale.set(0.06, 0.06);
        this.vy = 20;
        this.zIndex = 2;
        this.position.y = side ? app.view.height - 40 : app.view.height - 100;
        this.position.x = side === 'left' ? jet.x - 45 : side === 'right' ? jet.x + 45 : jet.x;
        this.damageSound = new Howl({ src: ['assets/sounds/jetDamage.mp3'], volume: 0.2 });

        parent.stage.addChild(this);
    }

    removeSelf() {
        app.stage.removeChild(this);
        app.ticker.remove(this.addBullet);
    }

    shoot(enemies, damage) {
        this.y -= this.vy;

        if (this.y < 0) {
            this.removeSelf();
            addScore(-10);
        }

        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const enemyHalf = e.width / 2;

            if (this.x >= e.x - enemyHalf && this.x <= e.x + enemyHalf && this.y <= e.y + enemyHalf) {
                this.removeSelf();
                this.damageSound.play();

                const explosionTextures = [];
                let k;

                for (k = 0; k < 26; k++) {
                    const texture = PIXI.Texture.from(`Explosion_Sequence_A ${k + 1}.png`);
                    explosionTextures.push(texture);
                }

                const explosion = new PIXI.AnimatedSprite(explosionTextures);
                let randomScale = randomInt(3, 4) / 10;
                explosion.scale.set(randomScale, randomScale);
                explosion.position.set(e.x - 40, e.y - 20)
                explosion.gotoAndPlay(1);
                explosion.removeSelf = () => {
                    app.stage.removeChild(explosion);
                }
                setTimeout(() => { explosion.stop(); explosion.removeSelf() }, 400)
                app.stage.addChild(explosion);

                if (e.health <= 0) {
                    enemies.splice(i, 1)
                    e.removeSelf();
                } else {
                    e.health -= damage;
                    addScore(10);
                }
            }
        }
    }
}