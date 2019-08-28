let score = 0;

let randomEnemy;

const levelElement = document.getElementById('level');
const health = document.getElementById('health');
const scoreElement = document.getElementById('score');
const loadText = document.getElementById('loader');
const startBtn = document.getElementById('begin');
const endBtn = document.getElementById('end');
const muteBtn = document.getElementById('mute-btn');

const enemies = [];

const shootBullet = (type, jet, damage, side) => {
    let bullet = new Bullet(app, resources[type].texture, jet, side, addBullet);
    function addBullet(){
        return bullet.shoot(enemies, damage)
    }
    app.ticker.add(addBullet);

    app.stage.updateLayersOrder();
}

startBtn.addEventListener('mouseover', () => {
    TweenLite.to(startBtn, 0.1, { scale: 1.2, ease: Power2.easeOut });
});

startBtn.addEventListener('mouseout', () => {
    TweenLite.to(startBtn, 0.1, { scale: 1, ease: Power2.easeOut });
});

endBtn.addEventListener('mouseover', () => {
    TweenLite.to(endBtn, 0.1, { scale: 1.2, ease: Power2.easeOut });
});

endBtn.addEventListener('mouseout', () => {
    TweenLite.to(endBtn, 0.1, { scale: 1, ease: Power2.easeOut });
});

TweenLite.to(loadText, 2.5, { scale: 3, opacity: 0, ease: Power4.easeIn });

setTimeout(() => {
    loadText.style.display = "none";
    startBtn.style.display = "block";

    TweenLite.from(startBtn, 2.5, { scale: 0, opacity: 0, ease: Power4.easeOut });
}, 2500)

const startSound = new Howl({ src: ['assets/sounds/rez-drone-looping.mp3'] });
startSound.play()

const gameOverSound = new Howl({ src: ['assets/sounds/gameover.mp3'] });

startSound.loop(true);

const intervals = [];

const updateLevel = (lvl, enemy) => {
    levelElement.innerHTML = `Level ${lvl}`;

    TweenLite.to(levelElement, 1, { y: window.innerHeight / 2, x: -window.innerWidth / 3, scale: 5, ease: Power1.easeOut });
    TweenLite.to(levelElement, 1, { y: 100, x: 0, scale: 1, ease: Power1.easeOut, delay: 2 });

    intervals.push(setInterval(() => {
        randomEnemy = randomInt(0, enemies.length - 1);
        try {
            enemies[randomEnemy].shoot();
        } catch (e) {
            console.log(e)
        }
    }, randomInt(enemy.speedMin, enemy.speedMax)))
}

const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const addScore = (newScore) => {
    score += newScore;
    document.getElementById("score").innerHTML = `Score ${score}`;
    TweenLite.to(scoreElement, 1, { scale: 1.5, ease: Power4.easeOut });
    TweenLite.to(scoreElement, 1, { scale: 1, ease: Power4.easeOut, delay: 0.1 });
}

stopShaking = (element) => {
    setTimeout(() => element.shake = false, 200)
}

const startGame = (jet, enemy, boss) => {
    startSound.stop();
    gameOverSound.stop();

    TweenLite.to(end, 1, { scale: 0, opacity: 0, ease: Power1.easeOut });
    startBtn.style.cursor = 'default';
    TweenLite.to(levelElement, 1, { y: 100, scale: 1, ease: Power1.easeOut });
    TweenLite.to(scoreElement, 1, { y: 100, x: 0, scale: 1, ease: Power1.easeOut });
    TweenLite.to(health, 1, { y: 100, scale: 1, opacity: 1, ease: Power1.easeOut });
    TweenLite.to(startBtn, 1, { scale: 2, opacity: 0, ease: Power1.easeOut });

    if (jet.health !== undefined) {
        jet.restart();
        levelElement.innerHTML = 'Level 0';
        TweenLite.to(levelElement, 1, { y: 430, x: -350, scale: 5, ease: Power1.easeOut });
        TweenLite.to(levelElement, 1, { y: 100, x: 0, scale: 1, ease: Power1.easeOut, delay: 2 });
        score = 0;
        addScore(0);
        enemy.restart(2);
        boss.restart(1000);
        intervals.forEach(i => clearInterval(i));
    }

    app.ticker.start();
    startBtn.removeEventListener('click', startGame);
}

startBtn.addEventListener('click', startGame)

const stopGame = (jet, enemy, boss) => {
    endBtn.style.display = 'block';

    gameOverSound.play();

    intervals.forEach(i => {
        clearInterval(i);
    })

    TweenLite.to(health, 1, { y: -100, scale: 0, opacity: 0, ease: Power1.easeIn });
    TweenLite.to(levelElement, 2, { scale: 0, ease: Power1.easeOut });
    TweenLite.to(scoreElement, 2, { y: (window.innerHeight / 2) + 150, x: (window.innerWidth / 3) - 40, scale: 1, ease: Power1.easeOut });
    TweenLite.to(end, 2, { scale: 1, opacity: 1, ease: Power1.easeIn });

    app.ticker.stop();
    endBtn.addEventListener('click', () => startGame(jet, enemy, boss));
}

const toggleMute = () => {
    if (muteBtn.innerHTML == `<i class="fa fa-volume-off"></i>`) {
        muteBtn.innerHTML = `<i class="fa fa-volume-up"></i>`;
        Howler.mute(false);
    }
    else {
        muteBtn.innerHTML = `<i class="fa fa-volume-off"></i>`;
        Howler.mute(true);
    }
}

muteBtn.addEventListener('click', toggleMute)
