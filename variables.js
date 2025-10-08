import { importWords } from "./utils.js";

export let elm = {
    scoreText: document.getElementById("score"),
    levelName: document.getElementById("level-name"),
    levelDecorator: document.getElementsByClassName("level-decorator"),
    progressBar: document.getElementById("progress-bar"),
    submitBtn: document.getElementById("submit-btn"),
    deleteBtn: document.getElementById("delete-btn"),
    shuffleBtn: document.getElementById("shuffle-btn"),
    scoreBtn: document.getElementById("score-btn"),
    shareBtn: document.getElementById("share-btn"),
    allNumpad: document.querySelectorAll(".numpad.letter"),
    mainNumpad: document.querySelector(".numpad.main"),
    regularNumpad: document.querySelectorAll(".numpad.letter:not(.main)"),
    notifyContainer: document.getElementById("notify-container"),
    notifyMessage: document.getElementById("nmessage"),
    correctWordList: document.getElementById("word-content"),
    closeScoreBtn: document.getElementById("score-close"),
    scoreContainer: document.getElementById("score-container"),
    recordContainer: document.getElementById("record-content"),
    enteredWord: document.getElementById("entered-word"),
    maximumBtn: document.getElementById("the-maximum"),
    maximumReverseBtn: document.getElementById("the-maximum-reverse"),
    minimumBtn: document.getElementById("the-minimum"),
    fullWordContainer: document.getElementById("full-word-container"),
    fullWordContent: document.getElementById("full-word-content"),
}

export let gdt = {
    stt: {
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
            "level_1.png",
            "level_2.png",
            "level_3.png",
            "level_4.png",
            "level_5.png",
            "level_6.png",
        ],
        todayDate: new Date().setHours(0, 0, 0, 0),
        bigWordList: await importWords("./list_1.0.0_nospace.txt"),
        smallWordList: [],
    },
    sets: {
        localStorageKey: "wordpad-str-00-0.12-record",
        notifyInterval: 2000,
        pointMultiplier: 1,
        basePoint: [
            22,
            48,
            78,
            128,
            198,
            288,
        ],
        pointEachLevel: [],
        mainLetter: "P",
        letterList: "ANKLRIG",
    },
    dyn: {
        point: 0,
        currentWord: "",
        correctWordList: [],
    }
}

gdt.sets.pointEachLevel = gdt.sets.basePoint.map((item) => item * gdt.sets.pointMultiplier);
gdt.stt.smallWordList = gdt.stt.bigWordList.filter((word) => {
    // Check if word includes center letter
    if (!word.includes(gdt.sets.mainLetter.toLowerCase())) return false;
    // Check if ALL letters in the word are from allowed set (center + outer letters)
    const allowedLetters = [...gdt.sets.letterList.split(""), gdt.sets.mainLetter].map((letter) =>
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

    static getAllComponent() {
        let _sortedList = this.allRecords.sort((a, b) => b.point - a.point);
        let _top10 = _sortedList.slice(0, 10);

        return _top10.map((item) => item.getComponent()).join("");
    }

    static storeClass(recordItem) {
        this.allRecords.push(recordItem);
        if (this.todayRecord === null && new Date(recordItem.date).setHours(0, 0, 0, 0) == gdt.stt.todayDate) {
            this.todayRecord = recordItem;
        }
    }

    static store(point, mainLetter, letterList, wordFound, date, levelName) {
        this.storeClass(new recordedPoint(point, mainLetter, letterList, wordFound, new Date(date).setHours(0, 0, 0, 0), levelName));
    }

    static saveToLocalStorage() {
        localStorage.setItem(gdt.sets.localStorageKey, JSON.stringify(this.allRecords));
    }

    static loadLocalStorage(updatePoint, updateCorrectList) {
        if (localStorage.getItem(gdt.sets.localStorageKey)) {
            let _allRecords = JSON.parse(localStorage.getItem(gdt.sets.localStorageKey));
            _allRecords.forEach((item) => {
                let _lclass = new recordedPoint(item.point, item.mainLetter, item.letterList, item.wordFound, item.date, item.levelName);
                this.storeClass(_lclass);

                if (new Date(item.date).setHours(0, 0, 0, 0) == gdt.stt.todayDate) {
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