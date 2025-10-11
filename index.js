import { elm, gd, gdp, recordedPoint } from "./variables.js";
import { toCaseSensitive } from "./utils.js";

function prepLetter(_letterList = gd.letterList) {
    let _letterArray = _letterList.split("");
    elm.regularNumpad.forEach((letterBtn) => {
        let _letter = _letterArray.shift();
        letterBtn.innerHTML = _letter;
        letterBtn.setAttribute("data-letter", _letter);
    });

    elm.mainNumpad.innerHTML = gd.mainLetter;
    elm.mainNumpad.setAttribute("data-letter", gd.mainLetter);
}

function loadVariables() {
    elm.levelDecorator.forEach((decorator) => {
        decorator.innerHTML = gd.levelDecorator[0];
    });

    elm.progressTrackDots.innerHTML = gd.levelList.map((level, index) => {
        return `<div data-tooltip="${index !== 0 ? gd.basePoint[index-1] : 0} poin" class="progress-dot ${index == 0 ? 'progress-dot--active' : 'tooltip-trigger'}" id="level-${index}"></div>`;
    }).join("");

    elm.tooltipTriggers = document.querySelectorAll(".tooltip-trigger");
}

function addTooltipListener() {
    let _freeze = false;

    elm.tooltipTriggers.forEach((trigger) => {
        trigger.addEventListener("mouseover", () => {
            if (!_freeze) {
                trigger.classList.toggle("tooltip--visible");
            }
        });

        // Prevent level-dot bug : mouse move down will choose previous dots
        trigger.addEventListener("mouseleave", () => {
            _freeze = true;
            trigger.classList.remove("tooltip--visible");
            
            setTimeout(() => {
                _freeze = false;
            }, 25);
        });
    });
}

function fnOnLoad() {
    prepLetter();
    loadVariables();
    addTooltipListener();
    recordedPoint.loadLocalStorage(updatePoint, updateCorrectList);

    if (recordedPoint.todayRecord == null) {
        recordedPoint.storeClass(new recordedPoint(gdp.point, gd.mainLetter, gd.letterList, [], gd.todayDate, gd.basePoint, elm.levelName.innerHTML));
    }
}

function updatePoint(point, firstLoad = false) {
    gdp.point += point;
    const _lvlIndex = gd.levelList.indexOf(elm.levelName.textContent);
    const _toNextLevel = gd.pointEachLevel[_lvlIndex];
    const _prevSecore = gd.pointEachLevel[_lvlIndex - 1] | 0;

    let _progressPercentage = ((gdp.point - _prevSecore) / _toNextLevel) * 100;
    elm.progressBar.style.width = `${(gdp.point / gd.pointEachLevel[gd.pointEachLevel.length - 1]) * 100}%`;

    if (_progressPercentage >= 100 && elm.levelName.innerHTML != gd.levelList[-1]) {
        elm.levelName.innerHTML = gd.levelList[_lvlIndex + 1];
        document.getElementById(`level-${_lvlIndex + 1}`).classList.add("progress-dot--active");

        // Change decoration at the right & left of level name
        elm.levelDecorator.forEach((decorator) => {
            decorator.innerHTML = gd.levelDecorator[_lvlIndex + 1];
        });

        setTimeout(() => {
            updatePoint(0);
        }, 550);
    }

    setTimeout(() => {
        elm.scoreText.innerHTML = gdp.point;
    }, gd.notifyInterval);

    if (firstLoad == false) {
        recordedPoint.todayRecord.point = gdp.point;
        recordedPoint.todayRecord.wordFound = gdp.correctWordList;
        recordedPoint.todayRecord.levelName = elm.levelName.innerHTML;
        recordedPoint.saveToLocalStorage();
    }
}

function notifier(message, type = "info") {
    let _extraClass = ["notification--visible"];
    elm.notifyMessage.textContent = message;

    if (type == "success") {
        _extraClass.push("notification--success");
        let _point = gdp.currentWord.length * gd.pointMultiplier;
        elm.notifyMessage.textContent = `${gd.successMessages[Math.floor(Math.random() * gd.successMessages.length)]
            } + ${_point} point`;
        updateEnteredWord("");
        updatePoint(_point);
    }

    elm.notifyContainer.classList.add(..._extraClass);
    // After notify container shown, hide it after sets seconds
    setTimeout(() => {
        elm.notifyMessage.textContent = "";
        elm.notifyContainer.classList.remove(..._extraClass);
    }, gd.notifyInterval);
}

function updateCorrectList(newWord) {
    if (!newWord) return;

    gdp.correctWordList.push(newWord);
    elm.correctWordList.insertAdjacentHTML("afterbegin", `<div class="word-item">${newWord}</div>`);
    elm.fullWordContent.insertAdjacentHTML("afterbegin", `<div class="word-item__full-view">${newWord}</div>`);
}

function shuffleLetter() {
    let _letterArray = gd.letterList.split("");
    _letterArray.sort(() => Math.random() - 0.5);
    gd.letterList = _letterArray.join("");
    prepareLetter(gd.letterList);
}

function handleNumpad(event) {
    let _letter = event.target.getAttribute("data-letter");
    updateEnteredWord(gdp.currentWord + _letter);
}

function updateEnteredWord(updatedWord) {
    gdp.currentWord = updatedWord;
    elm.enteredWord.innerHTML = gdp.currentWord;
}

elm.shuffleBtn.addEventListener("click", () => {
    shuffleLetter();
});

elm.deleteBtn.addEventListener("click", () => {
    updateEnteredWord(gdp.currentWord.slice(0, -1));
});

elm.submitBtn.addEventListener("click", () => {
    if (!gdp.currentWord.toLowerCase().includes(gd.mainLetter.toLowerCase())) {
        notifier(`Harus mengandung huruf utama '${gd.mainLetter}'!`);
        return;
    }

    if (gdp.currentWord.length <= 3) {
        notifier(`Terlalu pendek!`);
        return;
    }

    if (gdp.correctWordList.includes(toCaseSensitive(gdp.currentWord))) {
        notifier(`Kata sudah ditemukan!`);
        updateEnteredWord("");
        return;
    }

    if (!gd.smallWordList.includes(gdp.currentWord.toLowerCase())) {
        notifier(`Tidak ditemukan, ${gd.tryAgainMessage[Math.floor(Math.random() * gd.tryAgainMessage.length)]}`);
        updateEnteredWord("");
        return;
    }

    updateCorrectList(toCaseSensitive(gdp.currentWord));
    notifier("", "success");
});

elm.allNumpad.forEach((numpad) => {
    numpad.addEventListener("click", handleNumpad);
});

elm.scoreBtn.onclick = () => {
    elm.recordContainer.innerHTML = recordedPoint.getAllComponent();
    elm.scoreContainer.classList.toggle("score-modal--visible");
};

elm.closeScoreBtn.onclick = () => {
    elm.scoreContainer.classList.remove("score-modal--visible");
};

window.addEventListener("click", (e) => {
    if (elm.scoreContainer.classList.contains("score-modal--visible")) {
        if (!elm.scoreContainer.contains(e.target) && !elm.scoreBtn.contains(e.target)) {
            elm.scoreContainer.classList.remove("score-modal--visible");
        }
    }

    if (elm.fullWordContainer.classList.contains("words-panel__expanded--open")) {
        if (!elm.fullWordContainer.contains(e.target) && !elm.maximumBtn.contains(e.target)) {
            elm.fullWordContainer.classList.remove("words-panel__expanded--open");
            elm.maximumReverseBtn.style.zIndex = 1;
        }
    }
});

elm.maximumBtn.onclick = () => {
    elm.fullWordContainer.classList.toggle("words-panel__expanded--open");

    // Show button after animation to make it smoother
    setTimeout(() => {
        elm.maximumReverseBtn.style.zIndex = 66;
    }, 200)
};

[elm.maximumReverseBtn, elm.minimumBtn].forEach((btn) => {
    btn.onclick = () => {
        elm.fullWordContainer.classList.remove("words-panel__expanded--open");
        elm.maximumReverseBtn.style.zIndex = 1;
    }
});

fnOnLoad();