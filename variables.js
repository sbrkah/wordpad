import { importSets, stringifyDate } from "./utils.js";

export const url = "https://sbrkah.github.io/wordpad-be/api/daily-set.json";
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
    scoreDisplay: document.querySelector(".score-display"),
    changeTheme: document.getElementById("theme-btn"),
    changeThemeIcon: document.getElementById("theme-btn__icon"),
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
    bigSets: await importSets("./hash_1.0.1.array.txt", true),
    smallSets: [],
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
    builderLetter: "ANKLRIG",
}

export let gdp = {
    point: 0,
    currentWord: "",
    correctWordList: [],
}

Object.assign(gd, await fetch(url).then(res => res.json()));
gd.pointEachLevel = gd.basePoint.map((item) => item * gd.pointMultiplier);

const allowedLetters = [gd.mainLetter, ...gd.builderLetter.split("")];
const isValidSet = (wordsets) => {
    let letter = [...wordsets];
    return wordsets.has(gd.mainLetter) && letter.every((char) => allowedLetters.includes(char));
}
gd.smallSets = gd.bigSets
    .filter((item) => isValidSet(new Set(item.set)))
    .map(item => item.hash);

export class recordedPoint {
    static allRecords = [];
    static todayRecord = null;

    constructor(point, mainLetter, builderLetter, wordFound, date, basePoint, levelName = "Pemulai") {
        this.point = point;
        this.mainLetter = mainLetter;
        this.builderLetter = builderLetter;
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
                    <span class="record-item__date">${stringifyDate(this.date)}</span>
                </div>
                <div class="record-item__container">
                    <div class="record-item__word-count">
                        Berhasil menemukan <span class="record-item__word-count--total">${this.wordFound.length}</span> Kata
                    </div>
                    <div class="record-item__letters">
                        <div class="record-item__letter record-item__letter--main">${this.mainLetter.toUpperCase()}</div>
                        ${this.builderLetter.toUpperCase().split("").sort().map((item) => `<div class="record-item__letter">${item}</div>`).join("")}
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

    static store(point, mainLetter, builderLetter, wordFound, date, basePoint, levelName) {
        this.storeClass(new recordedPoint(point, mainLetter, builderLetter, basePoint, wordFound, new Date(date).setHours(0, 0, 0, 0), levelName));
    }

    static saveToLocalStorage() {
        localStorage.setItem(gd.localStorageKey, JSON.stringify(this.allRecords));
    }

    static loadLocalStorage(updatePoint, updateCorrectList) {
        if (localStorage.getItem(gd.localStorageKey)) {
            let _allRecords = JSON.parse(localStorage.getItem(gd.localStorageKey));
            _allRecords.forEach((item) => {
                let _lclass = new recordedPoint(item.point, item.mainLetter, item.builderLetter, item.wordFound, item.date, item.basePoint, item.levelName);
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