let score = 0;

let randomEnemy;

const level = document.getElementById('level');
const health = document.getElementById('health');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('begin');
const endBtn = document.getElementById('end');
const muteBtn = document.getElementById('mute-btn');

const startSound = new Howl({ src: ['assets/sounds/rez-drone-looping.mp3'] });
startSound.play()

let shootsound = new Howl({ src: ['assets/sounds/cannon.mp3'] });

let interval = setInterval(() => { startSound.play() }, 12000);

const intervals = [];

const updateLevel = (lvl, enemy) => {
    level.innerHTML = `Level ${lvl}`;
    if (level % 2 === 0) {
        enemy.texture = "assets/enemy2.png";
    }

    TweenLite.to(level, 1, { y: window.innerHeight / 2, x: -window.innerWidth / 3, scale: 5, ease: Power1.easeOut });
    TweenLite.to(level, 1, { y: 100, x: 0, scale: 1, ease: Power1.easeOut, delay: 2 });

    intervals.push(setInterval(() => {
        randomEnemy = randomInt(0, enemy.getEnemies().length - 1);
        try {
            enemy.getEnemies()[randomEnemy].shoot();
            shootsound.play();
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
    clearInterval(interval)

    TweenLite.to(end, 1, { scale: 0, opacity: 0, ease: Power1.easeOut });
    startBtn.style.cursor = 'default';
    TweenLite.to(level, 1, { y: 100, scale: 1, ease: Power1.easeOut });
    TweenLite.to(scoreElement, 1, { y: 100, x: 0, scale: 1, ease: Power1.easeOut });
    TweenLite.to(health, 1, { y: 100, scale: 1, opacity: 1, ease: Power1.easeOut });
    TweenLite.to(startBtn, 1, { scale: 2, opacity: 0, ease: Power1.easeOut });

    if (jet.health !== undefined) {
        jet.restart();
        level.innerHTML = 'Level 0';
        TweenLite.to(level, 1, { y: 430, x: -350, scale: 5, ease: Power1.easeOut });
        TweenLite.to(level, 1, { y: 100, x: 0, scale: 1, ease: Power1.easeOut, delay: 2 });
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

    TweenLite.to(health, 1, { y: -100, scale: 0, opacity: 0, ease: Power1.easeIn });
    TweenLite.to(level, 2, { scale: 0, ease: Power1.easeOut });
    TweenLite.to(scoreElement, 2, { y: (window.innerHeight / 2) + 100, x: (window.innerWidth / 3) - 50, scale: 1, ease: Power1.easeOut });
    TweenLite.to(end, 2, { scale: 1, opacity: 1, ease: Power1.easeOut });

    app.ticker.stop();
    endBtn.addEventListener('click', () => startGame(jet, enemy, boss));
}

const toggleMute = () => {
    if(muteBtn.innerHTML == `<i class="fa fa-volume-off"></i>`){
        muteBtn.innerHTML = `<i class="fa fa-volume-up"></i>`;
        Howler.mute(false);
    }
    else {
        muteBtn.innerHTML = `<i class="fa fa-volume-off"></i>`;
        Howler.mute(true);
    }
}

muteBtn.addEventListener('click', toggleMute)
