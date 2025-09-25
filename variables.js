export let elm = {
    scoreText: document.getElementById("score"),
    levelName: document.getElementById("level-name"),
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
}

export let gdt = {
    static: {

    },
    settings: {
        
    },
    dynamic: {

    }
}

// let scoreElement = document.getElementById("score");
// let levelNameElement = document.getElementById("level-name");
// let progressBarElement = document.getElementById("progress-bar");
// let submitElement = document.getElementById("submit-btn");
// let deleteElement = document.getElementById("delete-btn");
// let shuffleElement = document.getElementById("shuffle-btn");
// let allNumpadElement = document.querySelectorAll(".numpad.letter");
// let regularNumpadElement = document.querySelectorAll(".numpad.letter:not(.main)");
// let mainNumpadElement = document.querySelector(".numpad.main");
// let notifyElement = document.getElementById("notify-container");
// let nmessageElement = document.getElementById("nmessage");
// let wordListElement = document.getElementById("word-content");
// let scoreBtnElement = document.getElementById("score-btn");
// let shareBtnElement = document.getElementById("share-btn");
// let scoreCloseElement = document.getElementById("score-close");
// let scoreContainerElement = document.getElementById("score-container");
// let recordElement = document.getElementById("record-content");