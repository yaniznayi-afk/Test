let viewHistoryArray = [];
let currntntScreen = 'screen-main';
let isTransitioningBlock = false;

let globState = { 
    gradeNum: null, 
    subjectStr: null, 
    diffLvl: null, 
    curentQList: [], 
    curntntIdex: 0, 
    misstakes: 0, 
    userLog: [] 
};

const fadeOvrlayElement = document.getElementById('fade-overlay');
const navicnsBox = document.getElementById('nav-icons');

function shufleArrayItems(arrOrig) {
    let nArr = [];
    for (let e = 0; e < arrOrig.length; e++) {
        nArr.push(arrOrig[e]);
    }
    
    for (let f = nArr.length - 1; f > 0; f--) {
        const jndex = Math.floor(Math.random() * (f + 1));
        let tmpVal = nArr[f];
        nArr[f] = nArr[jndex];
        nArr[jndex] = tmpVal;
    }
    return nArr;
}

function fixRussionLayout(inputStr) {
    const replcrDict = { 'q':'й', 'w':'ц', 'e':'у', 'r':'к', 't':'е', 'y':'н', 'u':'г', 'i':'ш', 'o':'щ', 'p':'з', '[':'х', ']':'ъ', 'a':'ф', 's':'ы', 'd':'в', 'f':'а', 'g':'п', 'h':'р', 'j':'о', 'k':'л', 'l':'д', ';':'ж', "'":'э', 'z':'я', 'x':'ч', 'c':'с', 'v':'м', 'b':'и', 'n':'т', 'm':'ь', ',':'б', '.':'ю' };
    let resultngString = "";
    let lowcaseStr = inputStr.toLowerCase();
    
    for (let h = 0; h < lowcaseStr.length; h++) {
        let snglChar = lowcaseStr[h];
        if (replcrDict[snglChar]) {
            resultngString += replcrDict[snglChar];
        } else {
            resultngString += snglChar;
        }
    }
    return resultngString.trim();
}

function makeGradeMenut() {
    const wrappr = document.getElementById('grades-container');
    for (let it = 1; it <= 9; it++) {
        const grCirc = document.createElement('div');
        
        grCirc.className = "grade-circle ";
        if (it === 4 || it === 5 || it === 7 || it === 8) {
            grCirc.className += "bg-red";
        } else {
            grCirc.className += "bg-gray";
        }

        grCirc.innerText = it;
        
        grCirc.onclick = function() {
            if (isTransitioningBlock) {
                return;
            }
            if (it !== 4 && it !== 5 && it !== 7 && it !== 8) {
                document.getElementById('demo-modal').style.display = 'block';
            } else {
                globState.gradeNum = it; 
                if (it === 4) {
                    globState.subjectStr = 'Окружающий Мир';
                } else if (it === 5) {
                    globState.subjectStr = 'Биология';
                } else if (it === 7) {
                    globState.subjectStr = 'Физика';
                } else if (it === 8) {
                    globState.subjectStr = 'История';
                }
                
                prepareSbjtScreen(); 
                changeScreenVis('screen-subjects');
            }
        };
        wrappr.appendChild(grCirc);
    }
}
makeGradeMenut();

function prepareSbjtScreen() {
    const cntnr = document.getElementById('subjects-container');
    cntnr.innerHTML = '<button class="btn-sharp btn-subject" onclick="changeScreenVis(\'screen-mode\')">' + globState.subjectStr + '</button>';
    
    const txtTheoryBox = document.getElementById('theory-title');
    txtTheoryBox.innerText = "Теория для " + globState.gradeNum + " класса: " + globState.subjectStr;
}

function strtGameProcess() { 
    changeScreenVis('screen-grades'); 
}

function beginPrcticeLevel(difLvlCode) {
    let sbjEngWord = "nature";
    if (globState.subjectStr === "История") {
        sbjEngWord = "history";
    } else if (globState.subjectStr === "Биология") {
        sbjEngWord = "biology";
    } else if (globState.subjectStr === "Физика") {
        sbjEngWord = "physics";
    }
    
    const comboKy = globState.gradeNum + "_" + sbjEngWord + "_" + difLvlCode;
    
    globState.diffLvl = difLvlCode; 
    globState.misstakes = 0; 
    globState.userLog = [];
    globState.curntntIdex = 0; 
    globState.curentQList = shufleArrayItems(questionsBaseData[comboKy]);
    
    renderQuestnView(); 
    changeScreenVis('screen-practice');
}

function renderQuestnView() {
    const practArea = document.getElementById('screen-practice');
    practArea.innerHTML = ''; 
    
    const currentQObje = globState.curentQList[globState.curntntIdex];
    
    const nmbrDiv = document.createElement('div');
    nmbrDiv.className = 'task-counter';
    nmbrDiv.innerText = "Задание " + (globState.curntntIdex + 1) + "/" + globState.curentQList.length;
    practArea.appendChild(nmbrDiv);

    if (currentQObje.image) {
        const imgTagg = document.createElement('img');
        imgTagg.src = currentQObje.image; 
        imgTagg.className = 'question-img';
        practArea.appendChild(imgTagg);
    }

    const mainTexto = document.createElement('div');
    mainTexto.className = 'question-text'; 
    mainTexto.innerText = currentQObje.text;
    practArea.appendChild(mainTexto);

    if (currentQObje.type === 'choice') {
        const griddy = document.createElement('div'); 
        griddy.className = 'grid-2x2';
        
        let choisesArr = shufleArrayItems(currentQObje.options);
        choisesArr.forEach(function(optntxt, inndx) {
            const ansBtn = document.createElement('button'); 
            ansBtn.className = 'btn-answer';
            
            if (choisesArr.length % 2 !== 0 && inndx === choisesArr.length - 1) {
                ansBtn.classList.add('odd-centered');
            }
            
            ansBtn.innerText = optntxt;
            ansBtn.onclick = function() {
                let itisRight = (optntxt === currentQObje.correctAnswer);
                registerPlyrAnswer(itisRight, optntxt, currentQObje.correctAnswer, ansBtn);
            };
            griddy.appendChild(ansBtn);
        });
        practArea.appendChild(griddy);

    } else if (currentQObje.type === 'matching') {
        const mWrap = document.createElement('div'); 
        mWrap.className = 'matching-container';
        const listOfSelects = [];
        
        currentQObje.items.forEach(function(itm) {
            const rowLine = document.createElement('div'); 
            rowLine.className = 'matching-row';
            
            const ddMenu = document.createElement('select'); 
            ddMenu.className = 'matching-select';
            ddMenu.innerHTML = '<option value="">-</option>'; 
            
            for (let vv = 1; vv <= currentQObje.items.length; vv++) {
                ddMenu.innerHTML += '<option value="' + vv + '">' + vv + '</option>';
            }
            
            listOfSelects.push(ddMenu); 
            rowLine.appendChild(ddMenu); 
            
            const itmLbl = document.createElement('span'); 
            itmLbl.innerText = itm; 
            rowLine.appendChild(itmLbl); 
            mWrap.appendChild(rowLine);
        });
        practArea.appendChild(mWrap);
        
        function updatteSelectsVals() {
            const choosenVlsLst = [];
            for (let k = 0; k < listOfSelects.length; k++) {
                if (listOfSelects[k].value !== "" && listOfSelects[k].value !== "-") {
                    choosenVlsLst.push(listOfSelects[k].value);
                }
            }
            
            for (let m = 0; m < listOfSelects.length; m++) {
                let curSel = listOfSelects[m];
                let valNow = curSel.value;
                
                for (let p = 0; p < curSel.options.length; p++) {
                    let currOpt = curSel.options[p];
                    
                    if (currOpt.value === "" || currOpt.value === "-") {
                        currOpt.disabled = false;
                        continue;
                    }
                    
                    if (choosenVlsLst.includes(currOpt.value) && currOpt.value !== valNow) {
                        currOpt.disabled = true;
                    } else {
                        currOpt.disabled = false;
                    }
                }
            }
        }
        
        listOfSelects.forEach(function(selll) {
            selll.addEventListener('change', updatteSelectsVals);
        });
        
        const pushBtn = document.createElement('button'); 
        pushBtn.className = 'btn-confirm'; 
        pushBtn.innerText = 'ПОДТВЕРДИТЬ';
        pushBtn.onclick = function() {
            let izAllGood = true;
            listOfSelects.forEach(function(ss) {
                if (ss.value === "") {
                    izAllGood = false;
                }
            });
            
            if (!izAllGood) {
                alert("Выберите все цифры!");
                return;
            }
            
            const plrData = listOfSelects.map(function(smap) { return smap.value; });
            let rightOrno = (JSON.stringify(plrData) === JSON.stringify(currentQObje.correctAnswers));
            
            registerPlyrAnswer(rightOrno, plrData.join(', '), currentQObje.correctAnswers.join(', '), pushBtn);
        };
        practArea.appendChild(pushBtn);

    } else if (currentQObje.type === 'text') {
        const inpField = document.createElement('input'); 
        inpField.className = 'text-input'; 
        inpField.placeholder = 'Ответ...';
        practArea.appendChild(inpField);
        
        const sbmtTxtBtn = document.createElement('button'); 
        sbmtTxtBtn.className = 'btn-confirm'; 
        sbmtTxtBtn.innerText = 'ПОДТВЕРДИТЬ';
        
        sbmtTxtBtn.onclick = function() {
            let writenTxt = inpField.value.trim();
            if (!writenTxt) {
                alert("Напиши ответ!");
                return;
            }
            let checkLogic = (fixRussionLayout(writenTxt) === currentQObje.correctAnswer.toLowerCase());
            registerPlyrAnswer(checkLogic, writenTxt, currentQObje.correctAnswer, sbmtTxtBtn);
        };
        practArea.appendChild(sbmtTxtBtn);

    } else if (currentQObje.type === 'multi-image') {
        const mltiArea = document.createElement('div'); 
        mltiArea.className = 'multi-img-grid';
        const pickdIdx = new Set();
        
        let arrayObj = [];
        for (let d = 0; d < currentQObje.images.length; d++) {
            arrayObj.push({ theSrc: currentQObje.images[d], rIdx: d });
        }
        
        let rendmzImages = shufleArrayItems(arrayObj);
        
        rendmzImages.forEach(function(imgDta) {
            const vizImg = document.createElement('img'); 
            vizImg.src = imgDta.theSrc; 
            vizImg.className = 'multi-img-item';
            
            vizImg.onclick = function() {
                if (pickdIdx.has(imgDta.rIdx)) { 
                    pickdIdx.delete(imgDta.rIdx); 
                    vizImg.classList.remove('selected'); 
                } else {
                    if (pickdIdx.size >= currentQObje.correctIndices.length) {
                        alert("Можно выбрать только " + currentQObje.correctIndices.length + "!");
                        return;
                    }
                    pickdIdx.add(imgDta.rIdx); 
                    vizImg.classList.add('selected');
                }
            };
            mltiArea.appendChild(vizImg);
        });
        practArea.appendChild(mltiArea);
        
        const multiBttnPush = document.createElement('button'); 
        multiBttnPush.className = 'btn-confirm'; 
        multiBttnPush.innerText = 'ПОДТВЕРДИТЬ';
        
        multiBttnPush.onclick = function() {
            if (pickdIdx.size < currentQObje.correctIndices.length) {
                alert("Выбери " + currentQObje.correctIndices.length + " фото!");
                return;
            }
            const sortedPlyr = Array.from(pickdIdx).sort();
            const srtedTru = [...currentQObje.correctIndices].sort();
            let testng = (JSON.stringify(sortedPlyr) === JSON.stringify(srtedTru));
            
            registerPlyrAnswer(testng, sortedPlyr, currentQObje.correctIndices, multiBttnPush);
        };
        practArea.appendChild(multiBttnPush);
        
    } else if (currentQObje.type === 'single-image') {
        const singlGrd = document.createElement('div'); 
        singlGrd.className = 'grid-2x2';
        
        let smplArr = [];
        for (let yx = 0; yx < currentQObje.images.length; yx++) {
            smplArr.push(currentQObje.images[yx]);
        }
        
        let mixxedSngl = shufleArrayItems(smplArr);
        
        mixxedSngl.forEach(function(singlPicUrl) {
            const actPic = document.createElement('img'); 
            actPic.src = singlPicUrl; 
            actPic.className = 'single-img-item';
            
            actPic.onclick = function() {
                let doesMtch = (singlPicUrl === currentQObje.correctAnswer);
                registerPlyrAnswer(doesMtch, singlPicUrl, currentQObje.correctAnswer, actPic);
            };
            singlGrd.appendChild(actPic);
        });
        practArea.appendChild(singlGrd);
        
    } else if (currentQObje.type === 'multi-choice') {
        const mltiTxtGrd = document.createElement('div');
        mltiTxtGrd.className = 'grid-2x2';
        const pckdOpts = new Set();

        let shfldOpts = shufleArrayItems(currentQObje.options);

        shfldOpts.forEach(function(optntx) {
            const multiTxtBtn = document.createElement('button');
            multiTxtBtn.className = 'btn-answer';
            multiTxtBtn.innerText = optntx;

            multiTxtBtn.onclick = function() {
                if (pckdOpts.has(optntx)) {
                    pckdOpts.delete(optntx);
                    multiTxtBtn.style.border = "4px solid transparent";
                } else {
                    if (pckdOpts.size >= currentQObje.correctOptions.length) {
                        alert("Можно выбрать только " + currentQObje.correctOptions.length + "!");
                        return;
                    }
                    pckdOpts.add(optntx);
                    multiTxtBtn.style.border = "4px solid red";
                }
            };
            mltiTxtGrd.appendChild(multiTxtBtn);
        });
        practArea.appendChild(mltiTxtGrd);

        const mltiTxtSbmt = document.createElement('button');
        mltiTxtSbmt.className = 'btn-confirm';
        mltiTxtSbmt.innerText = 'ПОДТВЕРДИТЬ';

        mltiTxtSbmt.onclick = function() {
            if (pckdOpts.size < currentQObje.correctOptions.length) {
                alert("Выбери " + currentQObje.correctOptions.length + " варианта!");
                return;
            }
            const usrArr = Array.from(pckdOpts).sort();
            const truuArr = [...currentQObje.correctOptions].sort();
            let issGudd = (JSON.stringify(usrArr) === JSON.stringify(truuArr));

            registerPlyrAnswer(issGudd, usrArr.join(', '), currentQObje.correctOptions.join(', '), mltiTxtSbmt);
        };
        practArea.appendChild(mltiTxtSbmt);
    }
}

function registerPlyrAnswer(isCorrectFlg, userrrTxt, correctTxtStr, clickedDiv) {
    if (isTransitioningBlock) {
        return;
    }
    isTransitioningBlock = true;
    
    if (isCorrectFlg === false) {
        globState.misstakes = globState.misstakes + 1;
    }
    
    globState.userLog.push({ 
        question: globState.curentQList[globState.curntntIdex], 
        userText: userrrTxt, 
        correctText: correctTxtStr, 
        isCorrect: isCorrectFlg 
    });
    
    if (clickedDiv.tagName === 'IMG') {
        if (isCorrectFlg) {
            clickedDiv.style.borderColor = 'green';
        } else {
            clickedDiv.style.borderColor = 'red';
        }
    } else {
        if (isCorrectFlg) {
            clickedDiv.style.backgroundColor = 'green';
        } else {
            clickedDiv.style.backgroundColor = 'red';
        }
        clickedDiv.style.color = 'white';
    }
    
    setTimeout(function() {
        isTransitioningBlock = false; 
        globState.curntntIdex = globState.curntntIdex + 1;
        
        if (globState.curntntIdex >= globState.curentQList.length) {
            calccResultt(); 
        } else {
            renderQuestnView();
        }
    }, 600);
}

function calccResultt() {
    let finalGrd = 5;
    let encourgeMsg = '';
    
    if (globState.misstakes === 0) { 
        finalGrd = 5; 
        encourgeMsg = 'Ты - молодец!'; 
    } else if (globState.misstakes === 1) { 
        finalGrd = 4; 
        encourgeMsg = 'Ещё немного и ты молодец!'; 
    } else if (globState.misstakes === 2) { 
        finalGrd = 3; 
        encourgeMsg = 'Старайся! Всё получится!'; 
    } else { 
        finalGrd = 2; 
        encourgeMsg = 'Не расстраивайся, повтори материал и попробуй снова!'; 
    }

    document.getElementById('res-mark').innerText = finalGrd;
    document.getElementById('res-msg').innerText = encourgeMsg;
    document.getElementById('res-err').innerText = "Ошибок: " + globState.misstakes;

    const nxtLvll = document.getElementById('next-level-container');
    nxtLvll.innerHTML = '';
    
    if (globState.diffLvl === 'easy') {
        const goToMed = document.createElement('button'); 
        goToMed.className = 'btn-sharp btn-med'; 
        goToMed.innerText = 'Перейти на уровень Средний';
        goToMed.onclick = function() {
            beginPrcticeLevel('medium');
        };
        nxtLvll.appendChild(goToMed);
    } else if (globState.diffLvl === 'medium') {
        const goToHrdd = document.createElement('button'); 
        goToHrdd.className = 'btn-sharp btn-hard'; 
        goToHrdd.innerText = 'Перейти на уровень Сложный';
        goToHrdd.onclick = function() {
            beginPrcticeLevel('hard');
        };
        nxtLvll.appendChild(goToHrdd);
    } else if (globState.diffLvl === 'hard') {
        const grtzMsg = document.createElement('div'); 
        grtzMsg.className = 'congratulations-text';
        grtzMsg.innerText = 'Так держать! Ты прошёл самый сложный уровень! Можешь вернуться и закрепить материал или посмотреть другие предметы';
        nxtLvll.appendChild(grtzMsg);
    }

    prepareShowAndswrs();
    
    let tempHist = [];
    for (let o = 0; o < viewHistoryArray.length; o++) {
        if (viewHistoryArray[o] !== 'screen-practice') {
            tempHist.push(viewHistoryArray[o]);
        }
    }
    viewHistoryArray = tempHist;
    
    changeScreenVis('screen-result');
}

function prepareShowAndswrs() {
    const answCntnrr = document.getElementById('answers-container'); 
    answCntnrr.innerHTML = '';
    
    globState.userLog.forEach(function(lgg, idxx) {
        const blckDiv = document.createElement('div'); 
        blckDiv.className = 'ans-item';
        
        let bldString = "<b>Задание " + (idxx + 1) + "</b>";
        
        if (lgg.question.image) {
            bldString += '<img src="' + lgg.question.image + '" class="ans-img">';
        }
        
        bldString += '<div class="ans-question">' + lgg.question.text + '</div>';
        
        if (lgg.question.type === 'multi-image') {
            const cttGridy = function(picArray) {
                let bgstr = '<div class="multi-ans-grid">';
                picArray.forEach(function(idddd) {
                    bgstr += '<img src="' + lgg.question.images[idddd] + '">';
                });
                bgstr += '</div>';
                return bgstr;
            };
            
            bldString += '<div class="ans-correct">Правильно: ' + cttGridy(lgg.correctText) + '</div>';
            
            let crctClss = lgg.isCorrect ? '' : 'wrong';
            bldString += '<div class="ans-chosen ' + crctClss + '">Вы выбрали: ' + cttGridy(lgg.userText) + '</div>';
        } else if (lgg.question.type === 'single-image') {
            bldString += '<div class="ans-correct">Правильно: <br><img src="' + lgg.correctText + '" style="width: 100px; height: 100px; object-fit: cover; border: 2px solid green; margin-top: 5px;"></div>';
            
            let crctClss2 = lgg.isCorrect ? '' : 'wrong';
            let colrr = lgg.isCorrect ? 'green' : 'red';
            bldString += '<div class="ans-chosen ' + crctClss2 + '">Вы выбрали: <br><img src="' + lgg.userText + '" style="width: 100px; height: 100px; object-fit: cover; border: 2px solid ' + colrr + '; margin-top: 5px;"></div>';
        } else {
            bldString += '<div class="ans-correct">Верно: ' + lgg.correctText + '</div>';
            let crctClss3 = lgg.isCorrect ? '' : 'wrong';
            bldString += '<div class="ans-chosen ' + crctClss3 + '">Твой ответ: ' + lgg.userText + '</div>';
        }
        
        blckDiv.innerHTML = bldString; 
        answCntnrr.appendChild(blckDiv);
    });
}

function changeScreenVis(scrnNm, backwdsFlag) {
    if (isTransitioningBlock) {
        return;
    }
    if (currntntScreen === scrnNm) {
        return;
    }
    
    isTransitioningBlock = true; 
    fadeOvrlayElement.style.opacity = '1';
    
    setTimeout(function() {
        const ddOld = document.getElementById(currntntScreen);
        ddOld.classList.remove('active');
        
        if (!backwdsFlag) {
            if (currntntScreen !== 'screen-main' && currntntScreen !== 'screen-practice') {
                viewHistoryArray.push(currntntScreen);
            }
        }
        
        currntntScreen = scrnNm; 
        const ddNew = document.getElementById(currntntScreen);
        ddNew.classList.add('active');
        
        if (scrnNm === 'screen-main') {
            navicnsBox.classList.add('hidden');
        } else {
            navicnsBox.classList.remove('hidden');
        }
        
        fadeOvrlayElement.style.opacity = '0'; 
        isTransitioningBlock = false;
    }, 500);
}

function gobackHistory() { 
    if (currntntScreen === 'screen-answers') {
        changeScreenVis('screen-result', true);
    } else if (currntntScreen === 'screen-result') {
        let tempHist2 = [];
        for (let b = 0; b < viewHistoryArray.length; b++) {
            if (viewHistoryArray[b] !== 'screen-practice') {
                tempHist2.push(viewHistoryArray[b]);
            }
        }
        viewHistoryArray = tempHist2;
        changeScreenVis('screen-diff', true);
    } else if (viewHistoryArray.length > 0) {
        let ppped = viewHistoryArray.pop();
        changeScreenVis(ppped, true);
    } else {
        goHommme();
    }
}

function goHommme() { 
    viewHistoryArray = []; 
    changeScreenVis('screen-main'); 
}

window.addEventListener('resize', function() {
   let rrs = 0;
   rrs = rrs + 1;
});
