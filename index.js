import { elm, gd, gdp, recordedPoint } from "./variables.js";
import { toCaseSensitive, nilia } from "./utils.js";

function prepLetter(_builderLetter = gd.builderLetter) {
    let _letterArray = _builderLetter.toUpperCase().split("");
    elm.regularNumpad.forEach((letterBtn) => {
        let _letter = _letterArray.shift();
        letterBtn.innerHTML = _letter;
        letterBtn.setAttribute("data-letter", _letter);
    });

    elm.mainNumpad.innerHTML = gd.mainLetter.toUpperCase();
    elm.mainNumpad.setAttribute("data-letter", gd.mainLetter.toUpperCase());
}

function loadVariables() {
    elm.levelDecorator.forEach((decorator) => {
        decorator.innerHTML = gd.levelDecorator[0];
    });

    // Currently no-use, element hidden
    // elm.progressTrackDots.innerHTML = gd.levelList.map((level, index) => {
    //     return `
    //     <div data-tooltip="${index !== 0 ? gd.basePoint[index-1] : 0}&nbsp;poin" class="progress-dot ${index == 0 ? 'progress-dot--active' : 'tooltip-trigger'}" id="level-${index}">
    //         <div class="tooltip">${gd.basePoint[index - 1]}&nbsp;poin</div>
    //     </div>`;
    // }).join("");

    elm.scoreDisplay.querySelector(".tooltip").innerHTML = nilia(gd.basePoint).map((point, index) => {
        return `
            <div>
                ${point}&nbsp;Poin&nbsp;:&nbsp;${gd.levelDecorator[index + 1]}&nbsp;${gd.levelList[index + 1]}
            </div>`;
    }).join("")

    elm.tooltipTriggers = document.querySelectorAll(".tooltip-trigger");
}

function addTooltipListener() {
    elm.tooltipTriggers.forEach((trigger) => {
        let _tooltip = trigger.querySelector(".tooltip");

        // beware choose-prev bug : mouse move down will choose previous element (on js generated element)
        // use timeout as requirement to turn on tooltip
        trigger.addEventListener("mouseover", () => {
            _tooltip.classList.toggle("tooltip--visible");
        });

        trigger.addEventListener("mouseleave", () => {
            _tooltip.classList.remove("tooltip--visible");
        });

        _tooltip.addEventListener("mouseover", () => {
            _tooltip.classList.remove("tooltip--visible");
        });
    });
}

function fnOnLoad() {
    prepLetter();
    loadVariables();
    addTooltipListener();
    recordedPoint.loadLocalStorage(updatePoint, updateCorrectList);

    if (recordedPoint.todayRecord == null) {
        recordedPoint.storeClass(new recordedPoint(gdp.point, gd.mainLetter, gd.builderLetter, [], gd.todayDate, gd.basePoint, elm.levelName.innerHTML));
    }
}

function updatePoint(point, firstLoad = false) {
    gdp.point += point;
    const _lvlIndex = gd.levelList.indexOf(elm.levelName.textContent);

    elm.progressBar.style.width = `${(gdp.point / gd.pointEachLevel[gd.pointEachLevel.length - 1]) * 100}%`;
    
    if (gdp.point >= gd.basePoint[_lvlIndex] && elm.levelName.innerHTML != gd.levelList[-1]) {
        elm.levelName.innerHTML = gd.levelList[_lvlIndex + 1];

        // Currently no-use, element hidden
        // document.getElementById(`level-${_lvlIndex + 1}`).classList.add("progress-dot--active");

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
    elm.notifyMessage.innerHTML = message;

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
    let _letterArray = gd.builderLetter.split("");
    _letterArray.sort(() => Math.random() - 0.5);
    gd.builderLetter = _letterArray.join("");
    prepLetter(gd.builderLetter);
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
        notifier(`Harus&nbsp;mengandung&nbsp;huruf&nbsp;utama&nbsp;'${gd.mainLetter.toUpperCase()}'!`);
        return;
    }

    if (gdp.currentWord.length <= 3) {
        notifier(`Terlalu&nbsp;pendek!`);
        return;
    }

    if (gdp.correctWordList.includes(toCaseSensitive(gdp.currentWord))) {
        notifier(`Kata&nbsp;sudah&nbsp;ditemukan!`);
        updateEnteredWord("");
        return;
    }

    const _hex = SHA256.createHash().update(gdp.currentWord.toLowerCase()).digest("hex");

    if (!gd.smallSets.includes(_hex)) {
        notifier(`Tidak&nbsp;ditemukan, ${gd.tryAgainMessage[Math.floor(Math.random() * gd.tryAgainMessage.length)]}`);
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

elm.changeTheme.onclick = () => {
    if(document.body.dataset.theme == "dark") {
        document.body.dataset.theme = "light";
        elm.changeThemeIcon.classList.remove("fa-solid", "fa-moon");
        elm.changeThemeIcon.classList.add("fa-solid", "fa-sun"); 
    }else{
        document.body.dataset.theme = "dark";
        elm.changeThemeIcon.classList.remove("fa-solid", "fa-sun"); 
        elm.changeThemeIcon.classList.add("fa-solid", "fa-moon");
    }
}

[elm.maximumReverseBtn, elm.minimumBtn].forEach((btn) => {
    btn.onclick = () => {
        elm.fullWordContainer.classList.remove("words-panel__expanded--open");
        elm.maximumReverseBtn.style.zIndex = 1;
    }
});

fnOnLoad();