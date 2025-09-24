async function importWords(inputFile) {
    try {
        const response = await fetch(inputFile);
        const text = await response.text();
        const words = text
            .split("\n")
            .map((word) => word.trim())
            .filter((word) => word.length > 3);
        return words;
    } catch (e) {
        console.log(e);
    }
}

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
    8*scoreMultiplier,
    14*scoreMultiplier,
    28*scoreMultiplier,
    62*scoreMultiplier,
    100*scoreMultiplier,
    120*scoreMultiplier,
];
const notifInterval = 2000;
const localStorageKey = "wordpad-str-00-0.12";
const bigWordList = await importWords("./list_1.0.0_nospace.txt");
let score = 0;
let mainLetter = "P";
let letterList = "MKUTERS";
let currentWord = "";
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
let correctWordList = [];

// Element Html
let scoreElement = document.getElementById("score");
let levelNameElement = document.getElementById("level-name");
let progressBarElement = document.getElementById("progress-bar");
let submitElement = document.getElementById("submit-btn");
let deleteElement = document.getElementById("delete-btn");
let shuffleElement = document.getElementById("shuffle-btn");
let allNumpadElement = document.querySelectorAll(".numpad.letter");
let regularNumpadElement = document.querySelectorAll(
    ".numpad.letter:not(.main)"
);
let mainNumpadElement = document.querySelector(".numpad.main");
let notifyElement = document.getElementById("notify-container");
let nmessageElement = document.getElementById("nmessage");
let wordListElement = document.getElementById("word-content");

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

function updateScore(point) {
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
    saveToLocalStorage();
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

function toCaseSensitive(str) {
    if (!str) return ""; // handle empty/null/undefined
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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

function loadLocalStorage(address = localStorageKey) {
    if (localStorage.getItem(address)) {
        let { correctWordList, score, date } = JSON.parse(localStorage.getItem(address));
        
        if(new Date(date).getDate() !== new Date().getDate()) {
            correctWordList = [];
            score = 0;
            saveToLocalStorage();
            return;
        }

        correctWordList.forEach((word) => {
            updateCorrectList(word);
        });

        updateScore(score);
    }
}

function saveToLocalStorage(address = localStorageKey) {
    localStorage.setItem(address, JSON.stringify({
        correctWordList: correctWordList,
        score: score,
        date: new Date()
    }));
}


prepareLetter();
loadLocalStorage();