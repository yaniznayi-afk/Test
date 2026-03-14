let viewHistoryArray=[];let currentScreen='screen-main';let isTransitioning=false;
let globalState={gradeNumber:null,subjectString:null,difficultyLevel:null,currentQuestionList:[],currentQuestionIndex:0,mistakesCount:0,userLog:[]};
const fadeOverlayElement=document.getElementById('fade-overlay');const navigationIconsBox=document.getElementById('navigation-icons');

function showCustomAlert(message){document.getElementById('custom-modal-text').innerText=message;document.getElementById('modal-overlay').style.display='block';document.getElementById('custom-modal').style.display='block';}
function closeCustomAlert(){document.getElementById('modal-overlay').style.display='none';document.getElementById('custom-modal').style.display='none';}

function shuffleArrayItems(originalArray) {
    let newArray = new Array();
      for (let index = 0; index < originalArray.length; index++) { newArray.push(originalArray[index]); }
    let reverseIndex = newArray.length - 1;
       while (reverseIndex > 0) {
        let randomValString = Math.random().toString();
        let calculatedNum = parseFloat(randomValString) * (reverseIndex + 1);
          const randomIndex = Math.floor(calculatedNum);
        let temporaryValue = newArray[reverseIndex];
        newArray[reverseIndex] = newArray[randomIndex];
            newArray[randomIndex] = temporaryValue;
        reverseIndex = reverseIndex - 1;
    }
    return newArray;
}

function fixRussianKeyboardLayout(inputString) {
    let resultingString = ""; let lowercaseString = inputString.toLowerCase(); let replacerDictionary = { 'q':'й', 'w':'ц', 'e':'у', 'r':'к', 't':'е', 'y':'н', 'u':'г', 'i':'ш', 'o':'щ', 'p':'з', '[':'х', ']':'ъ', 'a':'ф', 's':'ы', 'd':'в', 'f':'а', 'g':'п', 'h':'р', 'j':'о', 'k':'л', 'l':'д', ';':'ж', "'":'э', 'z':'я', 'x':'ч', 'c':'с', 'v':'м', 'b':'и', 'n':'т', 'm':'ь', ',':'б', '.':'ю' };
    let charIndex = 0;
    while(charIndex < lowercaseString.length) {
         let singleCharacter = lowercaseString.charAt(charIndex);
        if (replacerDictionary[singleCharacter] !== undefined && replacerDictionary[singleCharacter] !== null) { resultingString = resultingString + replacerDictionary[singleCharacter]; } else { resultingString = resultingString + singleCharacter; }
        charIndex++;
    }
    return resultingString.trim();
}

function createGradeMenu() {
    let gradesContainer = document.getElementById('grades-container');
    let gradeIterator = 1;
    while(gradeIterator <= 9) {
        const gradeCircle = document.createElement('div');
        let tempClassName = "grade-circle ";
        if (gradeIterator === 4 || gradeIterator === 5 || gradeIterator === 7 || gradeIterator === 8) { tempClassName = tempClassName + "background-red"; } else { tempClassName = tempClassName + "background-gray"; }
        gradeCircle.className = tempClassName; gradeCircle.innerText = gradeIterator.toString();
        
        gradeCircle.onclick = (function(innerGrade) {
            return function() {
                if (isTransitioning === true) { return; }
                if (innerGrade !== 4 && innerGrade !== 5 && innerGrade !== 7 && innerGrade !== 8) { showCustomAlert("Данный класс отсутствует в демонстрации"); } else {
                    globalState.gradeNumber = innerGrade;
                    switch(innerGrade) { case 4: globalState.subjectString = 'Окружающий Мир'; break; case 5: globalState.subjectString = 'Биология'; break; case 7: globalState.subjectString = 'Физика'; break; case 8: globalState.subjectString = 'История'; break; }
                    prepareSubjectScreen(); changeScreenVisibility('screen-subjects');
                }
            }
        })(gradeIterator);
        gradesContainer.appendChild(gradeCircle); gradeIterator++;
    }
}
createGradeMenu();

function prepareSubjectScreen() {
    document.getElementById('subjects-container').innerHTML = '<button class="button-sharp button-subject" onclick="changeScreenVisibility(\'screen-mode\')">' + globalState.subjectString + '</button>';
    document.getElementById('theory-title').innerText = "Теория для " + globalState.gradeNumber + " класса: " + globalState.subjectString;
}

function startGameProcess(){changeScreenVisibility('screen-grades');}

function beginPracticeLevel(difficultyLevelCode) {
    let subjectEnglishWord = "";
    if (globalState.subjectString === "История") { subjectEnglishWord = "History"; } else { if (globalState.subjectString === "Биология") { subjectEnglishWord = "Biology"; } else { if (globalState.subjectString === "Физика") { subjectEnglishWord = "Physics"; } else { subjectEnglishWord = "Nature"; } } }
    let comboKey = ["grade", globalState.gradeNumber, subjectEnglishWord, difficultyLevelCode].join('');
    
    globalState.difficultyLevel = difficultyLevelCode; globalState.mistakesCount = 0; globalState.userLog = new Array(); globalState.currentQuestionIndex = 0; 
    let baseDataRef = questionsBaseData[comboKey]; globalState.currentQuestionList = shuffleArrayItems(baseDataRef);
    renderQuestionView(); changeScreenVisibility('screen-practice');
}

function renderQuestionView() {
    const practiceArea = document.getElementById('screen-practice'); practiceArea.innerHTML = '';
    let currentQuestionObject = globalState.currentQuestionList[globalState.currentQuestionIndex];
    let numberDivision = document.createElement('div'); numberDivision.className = 'task-counter'; numberDivision.innerText = "Задание " + (globalState.currentQuestionIndex + 1) + "/" + globalState.currentQuestionList.length; practiceArea.appendChild(numberDivision);

    if (currentQuestionObject.image !== undefined) { const imageTag = document.createElement('img'); imageTag.src = currentQuestionObject.image; imageTag.className = 'question-image'; practiceArea.appendChild(imageTag); }
    const mainText = document.createElement('div'); mainText.className = 'question-text'; mainText.innerText = currentQuestionObject.text; practiceArea.appendChild(mainText);

    if (currentQuestionObject.type === 'choice') {
        const gridContainer = document.createElement('div'); gridContainer.className = 'grid-two-by-two';
        let choicesArray = shuffleArrayItems(currentQuestionObject.options);
        for(let optionIndex = 0; optionIndex < choicesArray.length; optionIndex++) {
            let optionText = choicesArray[optionIndex];
            const answerButton = document.createElement('button'); answerButton.className = 'button-answer';
            if (choicesArray.length % 2 !== 0) { if (optionIndex === choicesArray.length - 1) { answerButton.classList.add('odd-centered'); } }
            answerButton.innerText = optionText;
            answerButton.onclick = function() {
                let checkStr1 = optionText.toString(); let checkStr2 = currentQuestionObject.correctAnswer.toString();
                let isCorrect = false; if (checkStr1 === checkStr2) { isCorrect = true; }
                registerPlayerAnswer(isCorrect, optionText, currentQuestionObject.correctAnswer, answerButton);
            };
            gridContainer.appendChild(answerButton);
        }
        practiceArea.appendChild(gridContainer);
    } else if (currentQuestionObject.type === 'matching') {
        const matchingWrapper = document.createElement('div'); matchingWrapper.className = 'matching-container'; const listOfSelectElements = [];
        for(let z=0; z<currentQuestionObject.items.length; z++) {
            let itemLabel = currentQuestionObject.items[z];
            const rowLine = document.createElement('div'); rowLine.className = 'matching-row';
            const dropdownMenu = document.createElement('select'); dropdownMenu.className = 'matching-select'; dropdownMenu.innerHTML = '<option value="">-</option>';
            let dropdownIndex = 1; while(dropdownIndex <= currentQuestionObject.items.length) { dropdownMenu.innerHTML += '<option value="' + dropdownIndex + '">' + dropdownIndex + '</option>'; dropdownIndex++; }
            listOfSelectElements.push(dropdownMenu); rowLine.appendChild(dropdownMenu);
            const itemSpan = document.createElement('span'); itemSpan.innerText = itemLabel; rowLine.appendChild(itemSpan); matchingWrapper.appendChild(rowLine);
        }
        practiceArea.appendChild(matchingWrapper);
        
        function updateSelectValues() {
            let chosenValuesList = [];
            for (let index = 0; index < listOfSelectElements.length; index++) { if (listOfSelectElements[index].value !== "" && listOfSelectElements[index].value !== "-") { chosenValuesList.push(listOfSelectElements[index].value); } }
            for (let index = 0; index < listOfSelectElements.length; index++) {
                let currentSelect = listOfSelectElements[index]; let valueNow = currentSelect.value;
                for (let optionIndex = 0; optionIndex < currentSelect.options.length; optionIndex++) {
                    let currentOption = currentSelect.options[optionIndex];
                    if (currentOption.value === "" || currentOption.value === "-") { currentOption.disabled = false; continue; }
                    if (chosenValuesList.indexOf(currentOption.value) !== -1 && currentOption.value !== valueNow) { currentOption.disabled = true; } else { currentOption.disabled = false; }
                }
            }
        }
        
        for(let selIdx=0; selIdx<listOfSelectElements.length; selIdx++) { listOfSelectElements[selIdx].addEventListener('change', updateSelectValues); }
        
        const pushButton = document.createElement('button'); pushButton.className = 'button-confirm'; pushButton.innerText = 'ПОДТВЕРДИТЬ';
        pushButton.onclick = function() {
            let isAllGood = true; for(let k=0; k<listOfSelectElements.length; k++) { if (listOfSelectElements[k].value === "") { isAllGood = false; } }
            if (isAllGood === false) { showCustomAlert("Выберите все цифры!"); return; }
            let playerData = []; for(let v=0; v<listOfSelectElements.length; v++) { playerData.push(listOfSelectElements[v].value); }
            let str1 = JSON.stringify(playerData); let str2 = JSON.stringify(currentQuestionObject.correctAnswers);
            let isRight = false; if (str1 === str2) { isRight = true; }
            registerPlayerAnswer(isRight, playerData.join(', '), currentQuestionObject.correctAnswers.join(', '), pushButton);
        };
        practiceArea.appendChild(pushButton);
    } else if (currentQuestionObject.type === 'text') {
        const inputField = document.createElement('input'); inputField.className = 'text-input'; inputField.placeholder = 'Ответ...'; practiceArea.appendChild(inputField);
        const submitTextButton = document.createElement('button'); submitTextButton.className = 'button-confirm'; submitTextButton.innerText = 'ПОДТВЕРДИТЬ';
        submitTextButton.onclick = function() {
            let writtenText = inputField.value.trim();
            if (writtenText.length === 0) { showCustomAlert("Напиши ответ!"); return; }
            let checkLogic = false; if (fixRussianKeyboardLayout(writtenText) === currentQuestionObject.correctAnswer.toLowerCase()) { checkLogic = true; }
            registerPlayerAnswer(checkLogic, writtenText, currentQuestionObject.correctAnswer, submitTextButton);
        };
        practiceArea.appendChild(submitTextButton);
    } else if (currentQuestionObject.type === 'multipleImage') {
        const multipleArea = document.createElement('div'); multipleArea.className = 'multiple-image-grid'; const pickedIndices = new Set();
        let arrayObjects = []; for (let imageIndex = 0; imageIndex < currentQuestionObject.images.length; imageIndex++) { arrayObjects.push({ imageSource: currentQuestionObject.images[imageIndex], originalIndex: imageIndex }); }
        let randomizedImages = shuffleArrayItems(arrayObjects);
        for(let imgIdx=0; imgIdx<randomizedImages.length; imgIdx++) {
            let imageData = randomizedImages[imgIdx]; const visualImage = document.createElement('img'); visualImage.src = imageData.imageSource; visualImage.className = 'multiple-image-item';
            visualImage.onclick = function() {
                if (pickedIndices.has(imageData.originalIndex) === true) { pickedIndices.delete(imageData.originalIndex); visualImage.classList.remove('selected'); } else {
                    if (pickedIndices.size >= currentQuestionObject.correctIndices.length) { showCustomAlert("Можно выбрать только " + currentQuestionObject.correctIndices.length + "!"); return; }
                    pickedIndices.add(imageData.originalIndex); visualImage.classList.add('selected');
                }
            };
            multipleArea.appendChild(visualImage);
        }
        practiceArea.appendChild(multipleArea);
        const multipleButtonPush = document.createElement('button'); multipleButtonPush.className = 'button-confirm'; multipleButtonPush.innerText = 'ПОДТВЕРДИТЬ';
        multipleButtonPush.onclick = function() {
            if (pickedIndices.size < currentQuestionObject.correctIndices.length) { showCustomAlert("Выбери " + currentQuestionObject.correctIndices.length + " фото!"); return; }
            let sortedPlayer = Array.from(pickedIndices); sortedPlayer.sort(); let sortedTrue = []; for(let c=0; c<currentQuestionObject.correctIndices.length; c++){sortedTrue.push(currentQuestionObject.correctIndices[c]);} sortedTrue.sort();
            let isTesting = false; if (JSON.stringify(sortedPlayer) === JSON.stringify(sortedTrue)) { isTesting = true; }
            registerPlayerAnswer(isTesting, sortedPlayer, currentQuestionObject.correctIndices, multipleButtonPush);
        };
        practiceArea.appendChild(multipleButtonPush);
    } else if (currentQuestionObject.type === 'singleImage') {
        const singleGrid = document.createElement('div'); singleGrid.className = 'grid-two-by-two'; let sampleArray = [];
        for (let imageIndex = 0; imageIndex < currentQuestionObject.images.length; imageIndex++) { sampleArray.push(currentQuestionObject.images[imageIndex]); }
        let mixedSingle = shuffleArrayItems(sampleArray);
        for(let sIdx=0; sIdx<mixedSingle.length; sIdx++) {
            let singlePictureUrl = mixedSingle[sIdx]; const actualPicture = document.createElement('img'); actualPicture.src = singlePictureUrl; actualPicture.className = 'single-image-item';
            actualPicture.onclick = function() {
                let doesMatch = false; if (singlePictureUrl === currentQuestionObject.correctAnswer) { doesMatch = true; }
                registerPlayerAnswer(doesMatch, singlePictureUrl, currentQuestionObject.correctAnswer, actualPicture);
            };
            singleGrid.appendChild(actualPicture);
        }
        practiceArea.appendChild(singleGrid);
    } else if (currentQuestionObject.type === 'multipleChoice') {
        const multipleTextGrid = document.createElement('div'); multipleTextGrid.className = 'grid-two-by-two'; const pickedOptions = new Set();
        let shuffledOptions = shuffleArrayItems(currentQuestionObject.options);
        for(let oIdx=0; oIdx<shuffledOptions.length; oIdx++) {
            let optionText = shuffledOptions[oIdx]; const multipleTextButton = document.createElement('button'); multipleTextButton.className = 'button-answer'; multipleTextButton.innerText = optionText;
            multipleTextButton.onclick = function() {
                if (pickedOptions.has(optionText) === true) { pickedOptions.delete(optionText); multipleTextButton.style.border = "4px solid transparent"; } else {
                    if (pickedOptions.size >= currentQuestionObject.correctOptions.length) { showCustomAlert("Можно выбрать только " + currentQuestionObject.correctOptions.length + "!"); return; }
                    pickedOptions.add(optionText); multipleTextButton.style.border = "4px solid red";
                }
            };
            multipleTextGrid.appendChild(multipleTextButton);
        }
        practiceArea.appendChild(multipleTextGrid);
        const multipleTextSubmit = document.createElement('button'); multipleTextSubmit.className = 'button-confirm'; multipleTextSubmit.innerText = 'ПОДТВЕРДИТЬ';
        multipleTextSubmit.onclick = function() {
            if (pickedOptions.size < currentQuestionObject.correctOptions.length) { showCustomAlert("Выбери " + currentQuestionObject.correctOptions.length + " варианта!"); return; }
            let userArray = Array.from(pickedOptions); userArray.sort(); let trueArray = []; for(let tIdx=0; tIdx<currentQuestionObject.correctOptions.length; tIdx++){trueArray.push(currentQuestionObject.correctOptions[tIdx]);} trueArray.sort();
            let isGood = false; if (JSON.stringify(userArray) === JSON.stringify(trueArray)) { isGood = true; }
            registerPlayerAnswer(isGood, userArray.join(', '), currentQuestionObject.correctOptions.join(', '), multipleTextSubmit);
        };
        practiceArea.appendChild(multipleTextSubmit);
    }
}

function registerPlayerAnswer(isCorrectFlag, userText, correctTextString, clickedElement) {
    if (isTransitioning === true) { return; } isTransitioning = true;
    if (isCorrectFlag === false) { globalState.mistakesCount = globalState.mistakesCount + 1; }
    globalState.userLog.push({ question: globalState.currentQuestionList[globalState.currentQuestionIndex], userText: userText, correctText: correctTextString, isCorrect: isCorrectFlag });
    
    if (clickedElement.tagName === 'IMG') {
        if (isCorrectFlag === true) { clickedElement.style.borderColor = 'green'; } else { clickedElement.style.borderColor = 'red'; }
    } else {
        if (isCorrectFlag === true) { clickedElement.style.backgroundColor = 'green'; } else { clickedElement.style.backgroundColor = 'red'; }
        clickedElement.style.color = 'white';
    }
    
    setTimeout(function() {
        isTransitioning = false; globalState.currentQuestionIndex = globalState.currentQuestionIndex + 1;
        if (globalState.currentQuestionIndex >= globalState.currentQuestionList.length) { calculateResult(); } else { renderQuestionView(); }
    }, 600);
}

function calculateResult() {
    let finalGrade = 0; let encouragingMessage = '';
    if (globalState.mistakesCount === 0) { finalGrade = 5; encouragingMessage = 'Ты - молодец!'; } else {
        if (globalState.mistakesCount === 1) { finalGrade = 4; encouragingMessage = 'Ещё немного и ты молодец!'; } else {
            if (globalState.mistakesCount === 2) { finalGrade = 3; encouragingMessage = 'Старайся! Всё получится!'; } else {
                finalGrade = 2; encouragingMessage = 'Не расстраивайся, повтори материал и попробуй снова!';
            }
        }
    }

    document.getElementById('result-mark').innerText = finalGrade.toString(); document.getElementById('result-message').innerText = encouragingMessage; document.getElementById('result-error-count').innerText = "Ошибок: " + globalState.mistakesCount;
    const nextLevelContainer = document.getElementById('next-level-container'); nextLevelContainer.innerHTML = '';
    
    if (globalState.difficultyLevel === 'Easy') {
        const goToMedium = document.createElement('button'); goToMedium.className = 'button-sharp button-medium'; goToMedium.innerText = 'Перейти на уровень Средний';
        goToMedium.onclick = function() { beginPracticeLevel('Medium'); }; nextLevelContainer.appendChild(goToMedium);
    } else if (globalState.difficultyLevel === 'Medium') {
        const goToHard = document.createElement('button'); goToHard.className = 'button-sharp button-hard'; goToHard.innerText = 'Перейти на уровень Сложный';
        goToHard.onclick = function() { beginPracticeLevel('Hard'); }; nextLevelContainer.appendChild(goToHard);
    } else if (globalState.difficultyLevel === 'Hard') {
        const congratulationsMessage = document.createElement('div'); congratulationsMessage.className = 'congratulations-text';
        congratulationsMessage.innerText = 'Так держать! Ты прошёл самый сложный уровень! Можешь вернуться и закрепить материал или посмотреть другие предметы';
        nextLevelContainer.appendChild(congratulationsMessage);
    }

    prepareShowAnswers();
    let temporaryHistory = [];
    for (let index = 0; index < viewHistoryArray.length; index++) { if (viewHistoryArray[index] !== 'screen-practice') { temporaryHistory.push(viewHistoryArray[index]); } }
    viewHistoryArray = temporaryHistory; changeScreenVisibility('screen-result');
}

function prepareShowAnswers() {
    const answersContainer = document.getElementById('answers-container'); answersContainer.innerHTML = '';
    for(let logIndex=0; logIndex<globalState.userLog.length; logIndex++) {
        let logItem = globalState.userLog[logIndex]; const blockDivision = document.createElement('div'); blockDivision.className = 'answer-item';
        let buildString = "<b>Задание " + (logIndex + 1).toString() + "</b>";
        if (logItem.question.image !== undefined) { buildString += '<img src="' + logItem.question.image + '" class="answer-image">'; }
        buildString += '<div class="answer-question">' + logItem.question.text + '</div>';
        
        if (logItem.question.type === 'multipleImage') {
            const createGrid = function(pictureArray) {
                let backgroundString = '<div class="multiple-answer-grid">';
                for(let pa=0; pa<pictureArray.length; pa++) { backgroundString += '<img src="' + logItem.question.images[pictureArray[pa]] + '">'; }
                backgroundString += '</div>'; return backgroundString;
            };
            buildString += '<div class="answer-correct">Правильно: ' + createGrid(logItem.correctText) + '</div>';
            let correctClass = ""; if(logItem.isCorrect === false){correctClass="wrong";}
            buildString += '<div class="answer-chosen ' + correctClass + '">Вы выбрали: ' + createGrid(logItem.userText) + '</div>';
        } else if (logItem.question.type === 'singleImage') {
            buildString += '<div class="answer-correct">Правильно: <br><img src="' + logItem.correctText + '" style="width: 100px; height: 100px; object-fit: cover; border: 2px solid green; margin-top: 5px;"></div>';
            let correctClass = ""; if(logItem.isCorrect===false){correctClass="wrong";} let colorString = "red"; if(logItem.isCorrect===true){colorString="green";}
            buildString += '<div class="answer-chosen ' + correctClass + '">Вы выбрали: <br><img src="' + logItem.userText + '" style="width: 100px; height: 100px; object-fit: cover; border: 2px solid ' + colorString + '; margin-top: 5px;"></div>';
        } else {
            buildString += '<div class="answer-correct">Верно: ' + logItem.correctText + '</div>';
            let correctClass = ""; if(logItem.isCorrect===false){correctClass="wrong";}
            buildString += '<div class="answer-chosen ' + correctClass + '">Твой ответ: ' + logItem.userText + '</div>';
        }
        blockDivision.innerHTML = buildString; answersContainer.appendChild(blockDivision);
    }
}

function changeScreenVisibility(screenName, isBackwardsNavigation) {
    if (isTransitioning === true) { return; } if (currentScreen === screenName) { return; }
    isTransitioning = true; fadeOverlayElement.style.opacity = '1';
    
    setTimeout(function() {
        const oldScreen = document.getElementById(currentScreen); oldScreen.classList.remove('active');
        if (isBackwardsNavigation !== true) { if (currentScreen !== 'screen-main' && currentScreen !== 'screen-practice') { viewHistoryArray.push(currentScreen); } }
        currentScreen = screenName; const newScreen = document.getElementById(currentScreen); newScreen.classList.add('active');
        if (screenName === 'screen-main') { navigationIconsBox.classList.add('hidden'); } else { navigationIconsBox.classList.remove('hidden'); }
        fadeOverlayElement.style.opacity = '0'; isTransitioning = false;
    }, 500);
}

function goBackInHistory() { 
    if (currentScreen === 'screen-answers') { changeScreenVisibility('screen-result', true); } else {
        if (currentScreen === 'screen-result') {
            let temporaryHistory = []; for (let index = 0; index < viewHistoryArray.length; index++) { if (viewHistoryArray[index] !== 'screen-practice') { temporaryHistory.push(viewHistoryArray[index]); } }
            viewHistoryArray = temporaryHistory; changeScreenVisibility('screen-difficulty', true);
        } else {
            if (viewHistoryArray.length > 0) { let poppedScreen = viewHistoryArray.pop(); changeScreenVisibility(poppedScreen, true); } else { goHome(); }
        }
    }
}

function goHome() { viewHistoryArray = new Array(); changeScreenVisibility('screen-main'); }

window.addEventListener('resize', function() { let resizeCounter = 0; while(resizeCounter < 1) { resizeCounter = resizeCounter + 1; } });

