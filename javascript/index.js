const app = new PIXI.Application({
    antialias: true, resolution: 1, autoResize: true, transparent: true || 1,
});

app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(app.view);

const Sprite = PIXI.Sprite,
    resources = PIXI.loader.resources,
    loader = PIXI.loader,
    TextureCache = PIXI.utils.TextureCache;

loader
    .add(["assets/background.png",
        "assets/spaceship.png",
        "assets/missile.png",
        "assets/enemy0.png",
        "assets/enemy1.png",
        "assets/enemy2.png",
        "assets/enemy3.png",
        "assets/enemy4.png",
        "assets/enemy5.png",
        "assets/enemy6.png",
        "assets/enemy7.png",
        "assets/enemy8.png",
        "assets/enemy9.png",
        "assets/enemy10.png",
        "assets/enemy11.png",
        "assets/bullet.png",
        "assets/enemyBullet.png",
        "assets/heart.png",
        'assets/healthbar2.png'])
        .add('spritesheet', 'assets/spritesheet/mc.json')
        .load(setup);

function setup() {
    let bg = new Sprite(resources["assets/background.png"].texture);
    bg.position.y = 0;
    bg.zIndex = 4;
    app.stage.addChild(bg);

    let jet = new Jet(app);
    let enemy = new Enemy('regular');
    let boss = new Enemy('boss');

    let lvl = 0;

    let left = keyboard("ArrowLeft"),
        right = keyboard("ArrowRight"),
        space = keyboard(" ");

    left.press = () => {
        jet.move(-10)
    };

    left.release = () => {
        if (!right.isDown) {
            jet.stop();
        }
    };

    right.press = () => {
        jet.move(10)
    };

    right.release = () => {
        if (!left.isDown) {
            jet.stop();
        }
    };

    space.press = () => {
        jet.shoot();
        interval = setInterval(() => jet.shoot(), 300);
    };

    space.release = () => {
        clearInterval(interval);
    };

    app.stage.updateLayersOrder = function () {
        app.stage.children.sort(function (a, b) {
            a.zIndex = a.zIndex || 0;
            b.zIndex = b.zIndex || 0;
            return b.zIndex - a.zIndex
        });
    };

    app.ticker.stop();

    app.ticker.add(() => {

        if (jet.getHealth() <= 0) {
            stopGame(jet, enemy, boss);
            lvl = 0;
        }

        jet.animate(app.view.width);
        jet.animateHealth();

        if (lvl % 5 === 0) {
            if (boss.getShouldSpawn()) {
                boss.animate(jet, bg, lvl);
                boss.shoot(jet);
            } else {
                setTimeout(() => {
                    boss.animate(jet, bg, lvl);
                    boss.shoot(jet);
                    boss.setShouldSpawn(true)
                }, 1500)
            }
        }
        else {
            if (enemy.getShouldSpawn()) {
                enemy.animate(jet, bg, lvl);
                enemy.shoot(jet);
            }
            else {
                setTimeout(() => {
                    enemy.animate(jet, bg, lvl);
                    enemy.shoot(jet);
                    enemy.setShouldSpawn(true)
                }, 1500)
            }
        }

        if (enemies.length <= 0) {
            lvl++;
            app.stage.children.length = 3;
            app.stage.addChild(jet);
            app.stage.addChild(bg);
            bg.position.set(0, 0);
            jet.getMissiles().length = 0;
            jet.updateHealth(1);

            if (lvl % 5 === 0) {
                updateLevel(lvl, boss);
                boss.spawn(lvl);
                boss.setShouldSpawn(false);
            }
            else {
                updateLevel(lvl, enemy);
                enemy.spawn(lvl);
                enemy.setShouldSpawn(false);
            }
        }
    })
}