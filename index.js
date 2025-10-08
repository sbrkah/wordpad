import { elm, gdt, recordedPoint } from "./variables.js";
import { toCaseSensitive } from "./utils.js";

function prepareLetter(_letterList = gdt.sets.letterList) {
    let _letterArray = _letterList.split("");
    elm.regularNumpad.forEach((letterBtn) => {
        let _letter = _letterArray.shift();
        letterBtn.innerHTML = _letter;
        letterBtn.setAttribute("data-letter", _letter);
    });

    elm.mainNumpad.innerHTML = gdt.sets.mainLetter;
    elm.mainNumpad.setAttribute("data-letter", gdt.sets.mainLetter);
}

function updatePoint(point, firstLoad = false) {
    gdt.dyn.point += point;
    const _lvlIndex = gdt.stt.levelList.indexOf(elm.levelName.textContent);
    const _toNextLevel = gdt.sets.pointEachLevel[_lvlIndex];
    const _prevSecore = gdt.sets.pointEachLevel[_lvlIndex - 1] | 0;

    let _progressPercentage = ((gdt.dyn.point - _prevSecore) / _toNextLevel) * 100;
    if (_progressPercentage >= 100) _progressPercentage = 100;
    elm.progressBar.style.width = `${_progressPercentage}%`;
    
    if (_progressPercentage >= 100 && elm.levelName.innerHTML != gdt.stt.levelList[-1]) {
        elm.levelName.innerHTML = gdt.stt.levelList[_lvlIndex + 1];
        document.getElementById(`level-${_lvlIndex + 2}`).classList.add("filled");
        
        // Change decoration at the right & left of level name
        for(var i = 0; i < elm.levelDecorator.length; i++){
            elm.levelDecorator[i].innerHTML = gdt.stt.levelDecorator[_lvlIndex + 1];
        }
        
        setTimeout(() => {
            updatePoint(0);
        }, 550);
    }

    setTimeout(() => {
        elm.scoreText.innerHTML = gdt.dyn.point;
    }, gdt.sets.notifyInterval);

    if (firstLoad == false) {
        recordedPoint.todayRecord.point = gdt.dyn.point;
        recordedPoint.todayRecord.wordFound = gdt.dyn.correctWordList;
        recordedPoint.todayRecord.levelName = elm.levelName.innerHTML;
        recordedPoint.saveToLocalStorage();
    }
}

function notifier(message, type = "info") {
    let _extraClass = ["show"];
    elm.notifyMessage.textContent = message;

    if (type == "success") {
        _extraClass.push("success");
        let _point = gdt.dyn.currentWord.length * gdt.sets.pointMultiplier;
        elm.notifyMessage.textContent = `${gdt.stt.successMessages[Math.floor(Math.random() * gdt.stt.successMessages.length)]
            } + ${_point} point`;
        updateEnteredWord("");
        updatePoint(_point);
    }

    elm.notifyContainer.classList.add(..._extraClass);
    // After notify container shown, hide it after sets seconds
    setTimeout(() => {
        elm.notifyMessage.textContent = "";
        elm.notifyContainer.classList.remove(..._extraClass);
    }, gdt.sets.notifyInterval);
}

function updateCorrectList(newWord) {
    if (!newWord) return;

    gdt.dyn.correctWordList.push(newWord);
    elm.correctWordList.insertAdjacentHTML("afterbegin", `<div class="word">${newWord}</div>`);
    elm.fullWordContent.insertAdjacentHTML("afterbegin", `<div class="word-full">${newWord}</div>`);
}

function shuffleLetter() {
    let _letterArray = gdt.sets.letterList.split("");
    _letterArray.sort(() => Math.random() - 0.5);
    gdt.sets.letterList = _letterArray.join("");
    prepareLetter(gdt.sets.letterList);
}

function handleNumpad(event) {
    let _letter = event.target.getAttribute("data-letter");
    updateEnteredWord(gdt.dyn.currentWord + _letter);
}

function updateEnteredWord(updatedWord) {
    gdt.dyn.currentWord = updatedWord;
    elm.enteredWord.innerHTML = gdt.dyn.currentWord;
}

elm.shuffleBtn.addEventListener("click", () => {
    shuffleLetter();
});

elm.deleteBtn.addEventListener("click", () => {
    updateEnteredWord(gdt.dyn.currentWord.slice(0, -1));
});

elm.submitBtn.addEventListener("click", () => {
    if (!gdt.dyn.currentWord.toLowerCase().includes(gdt.sets.mainLetter.toLowerCase())) {
        notifier(`Harus mengandung huruf utama '${gdt.sets.mainLetter}'!`);
        return;
    }

    if (gdt.dyn.currentWord.length <= 3) {
        notifier(`Terlalu pendek!`);
        return;
    }

    if (gdt.dyn.correctWordList.includes(toCaseSensitive(gdt.dyn.currentWord))) {
        notifier(`Kata sudah ditemukan!`);
        updateEnteredWord("");
        return;
    }

    if (!gdt.stt.smallWordList.includes(gdt.dyn.currentWord.toLowerCase())) {
        notifier(`Tidak ditemukan, ${gdt.stt.tryAgainMessage[Math.floor(Math.random() * gdt.stt.tryAgainMessage.length)]}`);
        updateEnteredWord("");
        return;
    }

    updateCorrectList(toCaseSensitive(gdt.dyn.currentWord));
    notifier("", "success");
});

elm.allNumpad.forEach((numpad) => {
    numpad.addEventListener("click", handleNumpad);
});

prepareLetter();
recordedPoint.loadLocalStorage(updatePoint, updateCorrectList);

if (recordedPoint.todayRecord == null) {
    recordedPoint.storeClass(new recordedPoint(gdt.dyn.point, gdt.sets.mainLetter, gdt.sets.letterList, [], gdt.stt.todayDate, elm.levelName.innerHTML));
}

elm.scoreBtn.onclick = () => {
    elm.recordContainer.innerHTML = recordedPoint.getAllComponent();
    elm.scoreContainer.classList.toggle("show");
};

elm.closeScoreBtn.onclick = () => {
    elm.scoreContainer.classList.remove("show");
};

window.addEventListener("click", (e) => {
    if (elm.scoreContainer.classList.contains("show")) {
        if (!elm.scoreContainer.contains(e.target) && !elm.scoreBtn.contains(e.target)) {
            elm.scoreContainer.classList.remove("show");
        }
    }

    if (elm.fullWordContainer.classList.contains("full")) {
        if (!elm.fullWordContainer.contains(e.target) && !elm.maximumBtn.contains(e.target)) {
            elm.fullWordContainer.classList.remove("full");
            elm.maximumReverseBtn.style.zIndex = 1;
        }
    }
});

elm.maximumBtn.onclick = () => {
    elm.fullWordContainer.classList.toggle("full");
    elm.maximumReverseBtn.style.zIndex = 66;
};

[elm.maximumReverseBtn, elm.minimumBtn].forEach((btn) => {
    btn.onclick = () => {
        elm.fullWordContainer.classList.remove("full");
        elm.maximumReverseBtn.style.zIndex = 1;
    }
});