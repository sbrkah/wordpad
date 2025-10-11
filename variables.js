import { importWords, stringifyDate } from "./utils.js";

export let elm = {
    scoreText: document.getElementById("score"),
    levelName: document.getElementById("level-name"),
    levelDecorator: document.querySelectorAll(".level-indicator__decorator"),
    progressBar: document.getElementById("progress-bar"),
    submitBtn: document.getElementById("submit-key"),
    deleteBtn: document.getElementById("delete-key"),
    shuffleBtn: document.getElementById("shuffle-key"),
    scoreBtn: document.getElementById("score-btn"),
    shareBtn: document.getElementById("share-btn"),
    allNumpad: document.querySelectorAll(".key.key--letter"),
    mainNumpad: document.querySelector(".key.key--primary"),
    regularNumpad: document.querySelectorAll(".key.key--letter:not(.key--primary)"),
    notifyContainer: document.getElementById("notification"),
    notifyMessage: document.getElementById("notification-message"),
    correctWordList: document.getElementById("words-compact-view"),
    closeScoreBtn: document.getElementById("close-modal"),
    scoreContainer: document.getElementById("score-modal"),
    recordContainer: document.getElementById("score-records"),
    enteredWord: document.getElementById("current-input"),
    maximumBtn: document.getElementById("toggle-expand"),
    maximumReverseBtn: document.getElementById("toggle-collapse"),
    minimumBtn: document.getElementById("toggle-minimize"),
    fullWordContainer: document.getElementById("words-full-view"),
    fullWordContent: document.getElementById("words-list"),
    progressTrackDots: document.querySelector(".progress-track__dots"),
    tooltipTriggers: document.querySelectorAll(".tooltip-trigger"),
}

export let gd = {
    tryAgainMessage: [
        "Yahhh.. Coba lagi!",
        "Jangan menyerah!",
        "Tetap semangat!",
        "Hampir saja!",
        "Kamu pasti bisa!",
    ],
    successMessages: [
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
    ],
    levelList: [
        "Pemula",
        "Menengah",
        "Mahir",
        "Profesional",
        "Master",
        "Grandmaster",
    ],
    levelDecorator: [
        `<i class="fa-solid fa-seedling"></i>`,
        `<i class="fa-solid fa-leaf"></i>`,
        `<i class="fa-solid fa-feather-pointed"></i>`,
        `<i class="fa-solid fa-graduation-cap"></i>`,
        `<i class="fa-solid fa-crow"></i>`,
        `<i class="fa-solid fa-crown"></i>`,
    ],
    todayDate: new Date().setHours(0, 0, 0, 0),
    bigWordList: await importWords("./list_1.0.0_nospace.txt"),
    smallWordList: [],
    localStorageKey: "wordpad-str-00-0.12-record",
    notifyInterval: 2000,
    pointMultiplier: 1,
    basePoint: [
        22,
        38,
        56,
        78,
        120,
    ],
    pointEachLevel: [],
    mainLetter: "P",
    letterList: "ANKLRIG",
}

export let gdp = {
    point: 0,
    currentWord: "",
    correctWordList: [],
}

gd.pointEachLevel = gd.basePoint.map((item) => item * gd.pointMultiplier);
gd.smallWordList = gd.bigWordList.filter((word) => {
    // Check if word includes center letter
    if (!word.includes(gd.mainLetter.toLowerCase())) return false;
    // Check if ALL letters in the word are from allowed set (center + outer letters)
    const allowedLetters = [...gd.letterList.split(""), gd.mainLetter].map((letter) =>
        letter.toLowerCase()
    );
    for (let char of word) {
        if (!allowedLetters.includes(char)) {
            return false;
        }
    }
    return true;
});

export class recordedPoint {
    static allRecords = [];
    static todayRecord = null;

    constructor(point, mainLetter, letterList, wordFound, date, basePoint, levelName = "Pemulai") {
        this.point = point;
        this.mainLetter = mainLetter;
        this.letterList = letterList;
        this.wordFound = wordFound;
        this.levelName = levelName;
        this.date = new Date(date);
        this.basePoint = basePoint;
    }

    getComponent() {
        return `
            <div class="record-item">
                <div class="record-item__container">
                    <div class="record-item__point">
                        <i class="fa-solid fa-feather-pointed"></i>
                        <h2 class="scored">${this.point}</h2>
                    </div>
                    <div class="record-item__word-count">
                        Menemukan
                        <span class="record-item__word-count--total">${this.wordFound.length}</span>
                        kata
                    </div>
                </div>
                <div class="record-item__game-data">
                    <span class="record-item__date">${stringifyDate(this.date)}</span>
                    <div class="record-item__letters">
                        <div class="record-item__letter record-item__letter--main">${this.mainLetter}</div>
                        ${this.letterList.split("").sort().map((item) => `<div class="record-item__letter">${item}</div>`).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    static getAllComponent() {
        let _sortedList = this.allRecords.sort((a, b) => b.point - a.point);
        let _top10 = _sortedList.slice(0, 10);

        return _top10.map((item) => item.getComponent()).join("");
    }

    static storeClass(recordItem) {
        this.allRecords.push(recordItem);
        if (this.todayRecord === null && new Date(recordItem.date).setHours(0, 0, 0, 0) == gd.todayDate) {
            this.todayRecord = recordItem;
        }
    }

    static store(point, mainLetter, letterList, wordFound, date, basePoint, levelName) {
        this.storeClass(new recordedPoint(point, mainLetter, letterList, basePoint, wordFound, new Date(date).setHours(0, 0, 0, 0), levelName));
    }

    static saveToLocalStorage() {
        localStorage.setItem(gd.localStorageKey, JSON.stringify(this.allRecords));
    }

    static loadLocalStorage(updatePoint, updateCorrectList) {
        if (localStorage.getItem(gd.localStorageKey)) {
            let _allRecords = JSON.parse(localStorage.getItem(gd.localStorageKey));
            _allRecords.forEach((item) => {
                let _lclass = new recordedPoint(item.point, item.mainLetter, item.letterList, item.wordFound, item.date, item.basePoint, item.levelName);
                this.storeClass(_lclass);

                if (new Date(item.date).setHours(0, 0, 0, 0) == gd.todayDate) {
                    this.todayRecord = _lclass;
                    updatePoint(item.point, true);
                    item.wordFound.forEach((word) => {
                        updateCorrectList(word);
                    });
                }
            });
        }
    }
}