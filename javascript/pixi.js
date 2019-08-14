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
    .add("assets/background.png")
    .add("assets/spaceship.png")
    .add("assets/missile.png")
    .add("assets/enemy0.png")
    .add("assets/enemy1.png")
    .add("assets/enemy2.png")
    .add("assets/enemy3.png")
    .add("assets/enemy4.png")
    .add("assets/enemy5.png")
    .add("assets/enemy6.png")
    .add("assets/enemy7.png")
    .add("assets/enemy8.png")
    .add("assets/enemy9.png")
    .add("assets/enemy10.png")
    .add("assets/enemy11.png")
    .add("assets/bullet.png")
    .add("assets/enemyBullet.png")
    .add("assets/heart.png")
    .add('assets/healthbar2.png')
    .add('spritesheet', 'assets/spritesheet/mc.json')
    .add('assets/sounds/laser.wav')
    .load(setup);

function setup() {
    let bg = new Sprite(resources["assets/background.png"].texture);
    bg.position.y = 0;
    bg.zIndex = 3;
    app.stage.addChild(bg);


    let jet = new Jet(app.view.width / 2, app.view.height - 75, 0.2, 4, "assets/spaceship.png")
    let enemy = new Enemy(33, 1, 1.5, 2.5, 310, 2000, 3000, 0.03, 70, 35);
    let boss = new Enemy(1, 500, 5, 5, 500, 800, 1000, 0.1, 300, 150);

    let level = 0;

    let left = keyboard("ArrowLeft"),
        up = keyboard("ArrowUp"),
        right = keyboard("ArrowRight"),
        down = keyboard("ArrowDown"),
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
            level = 0;
        }

        jet.animate(app.view.width);
        jet.animateHealth();

        if (level % 5 === 0) {
            jet.shooting(boss, level);
            if (boss.getShouldSpawn()) {
                boss.animate(jet, bg, level);
                boss.shoot(jet);
            } else {
                setTimeout(() => {
                    boss.animate(jet, bg, level);
                    boss.shoot(jet);
                    boss.setShouldSpawn(true)
                }, 1500)
            }
        }
        else {
            jet.shooting(enemy, level);
            if (enemy.getShouldSpawn()) {
                enemy.animate(jet, bg, level);
                enemy.shoot(jet);
            }
            else {
                setTimeout(() => {
                    enemy.animate(jet, bg, level);
                    enemy.shoot(jet);
                    enemy.setShouldSpawn(true)
                }, 1500)
            }
        }

        if (enemy.getEnemies().length <= 0 && boss.getEnemies().length <= 0) {
            level++;
            app.stage.children.length = 0;
            app.stage.addChild(bg);
            jet.addToStage();
            bg.position.set(0, 0);
            jet.getMissiles().length = 0;
            jet.updateHealth(1);

            if (level % 5 === 0) {
                updateLevel(level, boss);
                boss.spawn(level);
                boss.setShouldSpawn(false);
            }
            else {
                updateLevel(level, enemy);
                enemy.spawn(level);
                enemy.setShouldSpawn(false);
            }
        }
    })
}