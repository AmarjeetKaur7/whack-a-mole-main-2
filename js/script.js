// variables assigned
const cursor = document.querySelector(".cursor");
const holes = [...document.querySelectorAll(".hole")];
let score = 0;
const timerElement = document.getElementById("timer");
let timerSeconds = 60;
var url = new URL(window.location.href);
var urlParams = new URLSearchParams(window.location.search);
let paramUserID = urlParams.get("Email");
let ParamOrgID = urlParams.get("OrgID");
let M2OstAssesmentID = urlParams.get("M2ostAssessmentId");
let id_game = urlParams.get("idgame");
let gameAssesmentId = urlParams.get("gameassid");
let currentQuestionIndex = 0;
let UID = [];
let questionList = [];
let index = 0;
let timerInterval;
let currentQuestion;
let assessmentData = [];
let assessmentObject = [];
let selectedOptionData = null;
let submitBtn;
let isPopupOpen = false;
let gameStarted = false;
const sound = new Audio("../sound/ham_sound.mp3");
const afterHitSound = new Audio("../sound/smash_sound.mp3");


// shows instruction popup on page load
window.onload = function () {
  showWelcomePopup();
};

// Function to show instruction before game start
function showWelcomePopup() {
  let startPage = document.getElementById("start-page");
  startPage.classList.add("blur");
  document.getElementById("welcomePopup").classList.remove("hide");
  document.getElementById("playBtn").style.display = "none";
}

// Function to close the start instruction and start the game
function closeWelcomePopup() {
  let startPage = document.getElementById("start-page");
  startPage.classList.remove("blur");
  document.getElementById("welcomePopup").classList.add("hide");
  document.getElementById("playBtn").style.display = "block";
}

// Function to show the gameOver popup
function showGameOverPopup() {
  document.getElementById("gameOverPopup").style.display = "block";
  document.querySelector(".board").style.display = "none";
  document.querySelector(".cursor").style.display = "none";
  gameStarted = false;
}


// 
async function getIdUser(
  url = `https://www.playtolearn.in/Mini_games_Beta/api/UserDetail?OrgId=${ParamOrgID}&Email=${paramUserID}`
) {
  try {
    const response = await fetch(url, { method: "GET" });
    const encryptedData = await response.json();
    const IdUser = JSON.parse(encryptedData);
    console.log(IdUser);
    UID.push(IdUser);
    console.log(UID[0].Id_User);
    getDetails();
    return encryptedData;
  } catch (error) {
    console.error("Fetch error:", error.message);
    throw error;
  }
}

async function getDetails(
  url = `https://www.playtolearn.in/Mini_games_Beta/api/GetAssessmentDataList?OrgID=${ParamOrgID}&UID=${UID[0].Id_User}&M2ostAssessmentId=${M2OstAssesmentID}&idgame=${id_game}&gameassid=${gameAssesmentId}`
) {
  try {
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Network response was not ok, status code: ${response.status}`
      );
    }
    const encryptedData = await response.json();
    questionList = JSON.parse(encryptedData);
    console.log("ResponseData", questionList);
    return encryptedData;
  } catch (error) {
    console.error("Fetch error:", error.message);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", initializePage);

async function initializePage() {
  try {
    await getIdUser();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  }
}

async function saveAssessment(data) {
  try {
    let postData = data;

    const baseUrl = "https://www.playtolearn.in/";
    const endpoint = "Mini_games_Beta/api/assessmentdetailuserlog";
    const url = baseUrl + endpoint;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Save Assessment Error:", error.message);
    throw error;
  }
}
 
async function saveAssessmentMasterLog(data) {
  try {
    let postData = data;

    const baseUrl = "https://www.playtolearn.in/";
    const endpoint = "Mini_games_Beta/api/gameusermasterlog";
    const url = baseUrl + endpoint;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    const responsedata = await response.json();
    return responsedata;
  } catch (error) {
    console.error("Save Assessment Master Log Error:", error.message);
    throw error;
  }
}



// Function to play the game 
function gameplay() {
  gameStarted = true; // Set the gameStarted variable to true
  document.querySelector(".start-page").style.display = "none";
  document.querySelector(".whack-a-mole-container").style.display = "flex";
  cursor.style.display = "block";
  run();
}

// Function contains game logic 
function run() {
  if (!gameStarted) {
    return; 
  }

  const i = Math.floor(Math.random() * holes.length);
  const hole = holes[i];
  let timer = null;

  const img = document.createElement("img");
  img.classList.add("mole");
  img.src = "assets/blinking.gif";

  img.addEventListener("click", () => {
    sound.play();
    img.src = "assets/Hit.gif";
    gameStarted = false;
    setTimeout(() => {
      openModal();
    }, 1300);

    clearTimeout(timer);
    setTimeout(() => {
      afterHitSound.play();
      hole.removeChild(img);
      run();
    }, 500);
  });

  hole.appendChild(img);

  timer = setTimeout(() => {
    hole.removeChild(img);
    run();
  }, 1000);
}

// Mousemove event for desktop
window.addEventListener("mousemove", (e) => {
  cursor.style.top = e.pageY + "px";
  cursor.style.left = e.pageX + "px";
});

// // Touchmove event for mobile
// window.addEventListener("touchmove", (e) => {
//   const touch = e.touches[0];
//   cursor.style.top = touch.pageY + "px";
//   cursor.style.left = touch.pageX + "px";
// });

// Mousedown event for both desktop and mobile
window.addEventListener("mousedown", () => {
  cursor.classList.add("active");
});

// // Touchstart event for mobile
// window.addEventListener("touchstart", () => {
//   cursor.classList.add("active");
// });

// Mouseup event for both desktop and mobile
window.addEventListener("mouseup", () => {
  cursor.classList.remove("active");
});

// // Touchend event for mobile
// window.addEventListener("touchend", () => {
//   cursor.classList.remove("active");
// });

// Function to open the question modal on hit 
function openModal() {
  document.getElementById("questionModal").style.display = "block";
  document.querySelector(".cursor").style.display = "none";
  displayQuestion();
  clearInterval(timerInterval);
  startTimer();
  gameStarted = false;
  run();
}

// Function  to close the question modal
function closeModal() {
  document.querySelector(".cursor").style.display = "block";
  document.getElementById("questionModal").style.display = "none";
  clearInterval(timerInterval);
  gameStarted = true;
  run();
}

document.getElementById("timer").innerHTML = "10 sec";

// Function to start the timer
function startTimer() {
  let timer = 60;
  // Function to update the timing whenever new question appears
  function updateTimerDisplay() {
    document.getElementById("timer").innerHTML = `${timer} Sec`;
  }

  // Set the timer duration in seconds
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (timer > 0) {
      timer--; // Update the timer before decrementing
      updateTimerDisplay();
      // gameStarted = false;
    } else {
      clearInterval(timerInterval);
      closeModal();
      index++;
      if (index <= questionList.length) {
        assessmentData.push({
          ...currentQuestion,
          selectedOptionIndex: null,
        });
      }
      updateTimerDisplay();
    }
  }, 1000);
}

function displayQuestion() {
  currentQuestion = questionList[index];
  const questionText = document.getElementById("questionText");
  const optionsContainer = document.querySelector(".radio-container");
  const errorText = document.getElementById("error-text");

  if (currentQuestion) {
    // Display question text
    questionText.textContent = currentQuestion.Assessment_Question;
    // Clear previous options
    optionsContainer.innerHTML = "";

    // Display answer options
    currentQuestion.optionList.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "group";
      input.value = optionIndex + 1; // Adding 1 to make the value unique for each option
      label.appendChild(input);
      label.appendChild(document.createTextNode(option.Answer_Description));
      optionsContainer.appendChild(label);
    });

    // Clear error text
    errorText.textContent = "";

    // Get the assessment type
    const assessmentType = currentQuestion.Assessment_Type;
    console.log("at", assessmentType);

    // Depending on the assessment type, add the corresponding content
    const contentDiv = document.getElementById("contentDiv");

    // Clear previous content
    contentDiv.innerHTML = "";

    switch (assessmentType) {
      case 1:
        // Add image
        const imageUrl = currentQuestion.assessment_question_url;
        const imageElement = document.createElement("img");
        imageElement.src = imageUrl;
        imageElement.alt = "Image Alt Text";
        // imageElement.style.width = "100%";
        // imageElement.style.maxWidth = "100%";
        // imageElement.style.height = "24vh";
        // imageElement.style.borderRadius = "10px";
        imageElement.classList.add("assessment-image"); // Add class
        contentDiv.appendChild(imageElement);
        break;

      case 2:
        // Add audio
        const audioUrl = currentQuestion.assessment_question_url;
        const audioElement = document.createElement("audio");
        audioElement.controls = true;
        audioElement.src = audioUrl;
        contentDiv.appendChild(audioElement);
        break;

      case 3:
        // Add video
        const videoUrl = currentQuestion.assessment_question_url;
        const videoElement = document.createElement("video");
        videoElement.controls = true;
        videoElement.src = videoUrl;
        // videoElement.style.width = "100%";
        // videoElement.style.maxWidth = "100%";
        // videoElement.style.height = "22vh";
        videoElement.classList.add("assessment-video"); // Add class
        contentDiv.appendChild(videoElement);
        break;

      default:
        // Handle other assessment types or provide a default behavior
        contentDiv.textContent = "Unsupported assessment type";
    }
  } else {
    // If there are no more questions, display "Game Over" message
    onGameOver();
    questionText.textContent = "Game Over.All questions displayed.";
    optionsContainer.innerHTML = ""; // Clear any previous options
    document.getElementById("continueButton").style.display = "none"; // Hide the continue button
    document.getElementById("questionModal").style.display = "none";
    document.querySelector(".timerContainer").style.display = "none";
    document.querySelector(".modalfooter").style.display = "none";
    document.querySelector(".modalheader").style.display = "none";
    showGameOverPopup();
    gameStarted = false;
  }
}

// Function to store the details in the post api called above on gameOver 
function onGameOver() {
  // Check if all questions have been answered
  let saveAssessmentData = [];
  let assementDataForMasterLog = [];

  const mergedData = assessmentData.map((game) => ({ ...game }));

  for (let i = 0; i < mergedData.length; i++) {
    const currentQuestionData = mergedData[i];
    const selectedOptionIndex = currentQuestionData.selectedOptionIndex;
    console.log(selectedOptionIndex);
    if (selectedOptionIndex !== null) {
      let model = {
        ID_ORGANIZATION: ParamOrgID,
        id_user: UID[0].Id_User,
        Id_Assessment: currentQuestionData.Id_Assessment,
        Id_Game: currentQuestionData.Id_Game,
        attempt_no: currentQuestionData.allow_attempt,
        id_question: currentQuestionData.Id_Assessment_question,
        is_right: currentQuestionData.optionList[selectedOptionIndex].Right_Ans,
        score: currentQuestionData.optionList[selectedOptionIndex].Score_Coins,
        Id_Assessment_question_ans:
          currentQuestionData.optionList[selectedOptionIndex]
            .Id_Assessment_question_ans,
        Time: timerSeconds,
        M2ostAssessmentId: M2OstAssesmentID,
      };

      let modelForGameMasterLog = {
        ID_ORGANIZATION: ParamOrgID,
        id_user: UID[0].Id_User,
        Id_Room: mergedData[0].Id_Assessment,
        Id_Game: mergedData[0].Id_Game,
        attempt_no: mergedData[0].allow_attempt,
        score: score,
      };

      saveAssessmentData.push(model);
      assementDataForMasterLog.push(modelForGameMasterLog);
    } else {
      let model = {
        ID_ORGANIZATION: ParamOrgID,
        id_user: UID[0].Id_User,
        Id_Assessment: null,
        Id_Game: currentQuestionData.Id_Game,
        attempt_no: currentQuestionData.allow_attempt,
        id_question: currentQuestionData.Id_Assessment_question,
        is_right: 2,
        score: 0,
        Id_Assessment_question_ans: null,
        Time: timerSeconds,
        M2ostAssessmentId: M2OstAssesmentID,
      };
      let modelForGameMasterLog = {
        ID_ORGANIZATION: ParamOrgID,
        id_user: UID[0].Id_User,
        Id_Room: mergedData[0].Id_Assessment,
        Id_Game: mergedData[0].Id_Game,
        attempt_no: mergedData[0].allow_attempt,
        score: score,
      };
      saveAssessmentData.push(model);
      assementDataForMasterLog.push(modelForGameMasterLog);
    }
  }
  // Add API calls here
  saveAssessment(saveAssessmentData);
  saveAssessmentMasterLog(
    assementDataForMasterLog[assementDataForMasterLog.length - 1]
  );
}

// Event listener for the continue button
submitBtn = document
  .getElementById("continueButton")
  .addEventListener("click", function () {
    const selectedOption = document.querySelector(
      'input[name="group"]:checked'
    );
    if (selectedOption.checked) {
      const selectedOptionIndex = selectedOption.value - 1;
      const isCorrectOption =
        currentQuestion.optionList[selectedOptionIndex].Right_Ans;
      if (isCorrectOption == 1) {
        // Increase score by 10 points since the selected option is correct
        score += 10;
        updateScoreDisplay();
      } else {
        score += 0;
        updateScoreDisplay();
      }
      closeModal();
      index++;
      if (index <= questionList.length) {
        assessmentData.push({
          ...currentQuestion,
          selectedOptionIndex: selectedOptionIndex,
        });
      }
      clearInterval(timerInterval);
    } else {
      document.getElementById("error-text").textContent =
        "Please select an option.";
    }
  });

// Function to update the score and also to show current scoring  
function updateScoreDisplay() {
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = `Score: ${score}`;
}


let isPaused = false;

// Function to handle page visibility change
function handleVisibilityChange() {
  if (document.hidden) {
    // If the page is hidden (user switched tabs or minimized browser), pause the game
    pauseGame();
  } else {
    // If the page is visible again, resume the game
    resumeGame();
  }
}

// Function to pause the game
function pauseGame() {
  // Pause any game timers or animations
  isPaused = true;
}

// Function to resume the game
function resumeGame() {
  // Resume any paused timers or animations
  isPaused = false;
  
  // Ensure the game continues running if it was running before being paused
  if (gameStarted) {
    run(); // Restart the game logic
  }
}

// Add event listener for visibility change
document.addEventListener("visibilitychange", handleVisibilityChange);
