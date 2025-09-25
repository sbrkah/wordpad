import { importWords, toCaseSensitive } from "./utils.js";

// Element Html
let scoreElement = document.getElementById("score");
let levelNameElement = document.getElementById("level-name");
let progressBarElement = document.getElementById("progress-bar");
let submitElement = document.getElementById("submit-btn");
let deleteElement = document.getElementById("delete-btn");
let shuffleElement = document.getElementById("shuffle-btn");
let allNumpadElement = document.querySelectorAll(".numpad.letter");
let regularNumpadElement = document.querySelectorAll(".numpad.letter:not(.main)");
let mainNumpadElement = document.querySelector(".numpad.main");
let notifyElement = document.getElementById("notify-container");
let nmessageElement = document.getElementById("nmessage");
let wordListElement = document.getElementById("word-content");
let scoreBtnElement = document.getElementById("score-btn");
let shareBtnElement = document.getElementById("share-btn");
let scoreCloseElement = document.getElementById("score-close");
let scoreContainerElement = document.getElementById("score-container");
let recordElement = document.getElementById("record-content");

const tryAgainMessage = [
    "Yahhh.. Coba lagi!",
    "Jangan menyerah!",
    "Tetap semangat!",
    "Hampir saja!",
    "Kamu pasti bisa!",
];
const successMessages = [
    "Bagus!",
    "Hebat!",
    "Mantap!",
    "Keren!",
    "Juara!",
    "Oke!",
    "Sip!",
    "Yes!",
    "Cihuy!",
    "Top!",
];
const namaLevel = [
    "Pemula",
    "Menengah",
    "Mahir",
    "Profesional",
    "Master",
    "Grandmaster",
];
const scoreMultiplier = 1;
const scoreLevel = [
    22 * scoreMultiplier,
    48 * scoreMultiplier,
    78 * scoreMultiplier,
    128 * scoreMultiplier,
    198 * scoreMultiplier,
    288 * scoreMultiplier,
];
const todayDate = new Date().setHours(0, 0, 0, 0);
const notifInterval = 2000;
const localStorageKey = "wordpad-str-00-0.12-record";
const bigWordList = await importWords("./list_1.0.0_nospace.txt");

let score = 0;
let mainLetter = "G";
let letterList = "ANYZIRM";
let currentWord = "";
let correctWordList = [];
let smallWorldList = bigWordList.filter((word) => {
    // Check if word includes center letter
    if (!word.includes(mainLetter.toLowerCase())) return false;

    // Check if ALL letters in the word are from allowed set (center + outer letters)
    const allowedLetters = [...letterList.split(""), mainLetter].map((letter) =>
        letter.toLowerCase()
    );

    for (let char of word) {
        if (!allowedLetters.includes(char)) {
            return false;
        }
    }

    return true;
});

function prepareLetter(_letterList = letterList) {
    let _letterArray = letterList.split("");
    regularNumpadElement.forEach((letter) => {
        let _letter = _letterArray.shift();
        letter.innerHTML = _letter;
        letter.setAttribute("data-letter", _letter);
    });

    mainNumpadElement.innerHTML = mainLetter;
    mainNumpadElement.setAttribute("data-letter", mainLetter);
}

function updateScore(point, firstLoad = false) {
    score += point;
    const _lvlIndex = namaLevel.indexOf(levelNameElement.innerHTML);
    const _toNextLevel = scoreLevel[_lvlIndex];
    const _prevSecore = scoreLevel[_lvlIndex - 1] | 0;

    let _progressPercentage = ((score - _prevSecore) / _toNextLevel) * 100;
    if (_progressPercentage >= 100) _progressPercentage = 100;
    progressBarElement.style.width = `${_progressPercentage}%`;

    if (_progressPercentage >= 100) {
        levelNameElement.innerHTML = namaLevel[_lvlIndex + 1];
        document.getElementById(`level-${_lvlIndex + 2}`).classList.add("filled");
        setTimeout(() => {
            updateScore(0);
        }, 550);
    }

    setTimeout(() => {
        scoreElement.innerHTML = score;
    }, notifInterval);

    if(firstLoad == false) {
        recordedPoint.todayRecord.point = score;
        recordedPoint.todayRecord.wordFound = correctWordList;
        recordedPoint.saveToLocalStorage();
    }
}

function notifier(message, type = "info") {
    let _score = 0;
    let _extraClass = ["show"];
    nmessageElement.textContent = message;

    if (type == "success") {
        _extraClass.push("success");
        _score = currentWord.length * scoreMultiplier;
        nmessageElement.textContent = `${successMessages[Math.floor(Math.random() * successMessages.length)]
            } + ${_score} point`;
        updateEnteredWord("");
        updateScore(_score);
    }

    notifyElement.classList.add(..._extraClass);
    setTimeout(() => {
        nmessageElement.textContent = "";
        notifyElement.classList.remove(..._extraClass);
    }, notifInterval);
}

function updateCorrectList(newWord) {
    if (!newWord) return;

    correctWordList.push(newWord);
    wordListElement.insertAdjacentHTML("afterbegin", `<div class="word">${newWord}</div>`);
}

function shuffleLetter() {
    let _letterArray = letterList.split("");
    _letterArray.sort(() => Math.random() - 0.5);
    letterList = _letterArray.join("");
    prepareLetter(letterList);
}

function handleNumpad(event) {
    let _letter = event.target.getAttribute("data-letter");
    updateEnteredWord(currentWord + _letter);
}

function updateEnteredWord(updatedWord) {
    currentWord = updatedWord;
    document.getElementById("entered-word").innerHTML = currentWord;
}

shuffleElement.addEventListener("click", () => {
    shuffleLetter();
});

deleteElement.addEventListener("click", () => {
    updateEnteredWord(currentWord.slice(0, -1));
});

submitElement.addEventListener("click", () => {
    if (!currentWord.toLowerCase().includes(mainLetter.toLowerCase())) {
        notifier(`Harus mengandung huruf utama '${mainLetter}'!`);
        return;
    }

    if (currentWord.length <= 3) {
        notifier(`Terlalu pendek!`);
        return;
    }

    if (correctWordList.includes(toCaseSensitive(currentWord))) {
        notifier(`Kata sudah ditemukan!`);
        updateEnteredWord("");
        return;
    }

    if (!smallWorldList.includes(currentWord.toLowerCase())) {
        notifier(`Tidak ditemukan, ${tryAgainMessage[Math.floor(Math.random() * tryAgainMessage.length)]}`);
        updateEnteredWord("");
        return;
    }

    updateCorrectList(toCaseSensitive(currentWord));
    notifier("", "success");
});

allNumpadElement.forEach((numpad) => {
    numpad.addEventListener("click", handleNumpad);
});

class recordedPoint {
    static recordedPoints = [];
    static todayRecord = null;

    constructor(point, mainLetter, letterList, wordFound, date, levelName = "Pemulai") {
        this.point = point;
        this.mainLetter = mainLetter;
        this.letterList = letterList;
        this.wordFound = wordFound;
        this.levelName = levelName;
        this.date = new Date(date);
    }

    getComponent() {
        return `
            <div class="record-item">
                <div class="record-item-container">
                    <div class="record-item-point">
                        <i class="fa-solid fa-feather-pointed"></i>
                        <h2 class="scored">${this.point}</h2>
                    </div>
                    <div class="record-item-word">
                        Menemukan
                        <span class="worded total">${this.wordFound.length}</span>
                        <span class="worded">kata</span>
                    </div>
                </div>
                <div class="record-item-detail">
                    <span class="dated">${this.date.toDateString()}</span>
                    <div class="numpad-item-container">
                        <div class="numpad-item main">${this.mainLetter}</div>
                        ${this.letterList.split("").map((item) => `<div class="numpad-item">${item}</div>`).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    static getAllComponent(){
        let _sortedList = this.recordedPoints.sort((a, b) => b.point - a.point);
        let _top10 = _sortedList.slice(0, 10);

        return _top10.map((item) => item.getComponent()).join("");
    }

    static storeClass(recordItem) {
        this.recordedPoints.push(recordItem);
        if(this.todayRecord === null && new Date(recordItem.date).setHours(0, 0, 0, 0) == todayDate) {
            this.todayRecord = recordItem;
        }
    }

    static store(point, mainLetter, letterList, wordFound, date, levelName) {
        this.storeClass(new recordedPoint(point, mainLetter, letterList, wordFound, new Date(date).setHours(0, 0, 0, 0), levelName));
    }

    static saveToLocalStorage() {
        localStorage.setItem(localStorageKey, JSON.stringify(this.recordedPoints));
    }

    static loadLocalStorage() {
        if (localStorage.getItem(localStorageKey)) {
            let _recordedPoints = JSON.parse(localStorage.getItem(localStorageKey));
            _recordedPoints.forEach((item) => {
                let _lclass = new recordedPoint(item.point, item.mainLetter, item.letterList, item.wordFound, item.date, item.levelName);
                this.storeClass(_lclass);

                if(new Date(item.date).setHours(0, 0, 0, 0) == todayDate) {
                    this.todayRecord = _lclass;
                    updateScore(item.point, true);
                    item.wordFound.forEach((word) => {
                        updateCorrectList(word);
                    });
                }
            });
        }
    }
}

prepareLetter();
recordedPoint.loadLocalStorage();

if(recordedPoint.todayRecord == null) {
    recordedPoint.storeClass(new recordedPoint(score, mainLetter, letterList, [], todayDate, levelNameElement.innerHTML));
}

scoreBtnElement.onclick = () => {
    recordElement.innerHTML = recordedPoint.getAllComponent();
    scoreContainerElement.classList.toggle("show");
};

scoreCloseElement.onclick = () => {
    scoreContainerElement.classList.remove("show");
};

window.addEventListener("click", (e) => {
    if (scoreContainerElement.classList.contains("show")) {
        if (!scoreContainerElement.contains(e.target) && !scoreBtnElement.contains(e.target)) {
            scoreContainerElement.classList.remove("show");
        }
    }
});