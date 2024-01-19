const cursor = document.querySelector(".cursor");
const holes = [...document.querySelectorAll(".hole")];
const scoreEl = document.querySelector(".score span");
let score = 0;
// let isGamePaused = false;
const timerElement = document.getElementById("timer");
let timerSeconds = 30;
var url = new URL(window.location.href);
var urlParams = new URLSearchParams(window.location.search);
let paramUserID = urlParams.get("Email");
let ParamOrgID = urlParams.get("OrgID");
let M2OstAssesmentID = 0;
let id_game = urlParams.get("idgame");
let gameAssesmentId = urlParams.get("gameassid");
let currentQuestionIndex = 0;
let UID = [];
let questionList = []; // Declare questionList globally

//url https://www.playtolearn.in/Assessment/?userid=@userid&M2ostAssessmentId=@asid&idgame=10&gameassid
async function getIdUser(
  url = `https://www.playtolearn.in/Mini_games_beta/api/UserDetail?OrgId=${ParamOrgID}&Email=${paramUserID}`
) {
  try {
    const response = await fetch(url, { method: "GET" });
    const encryptedData = await response.json();
    const IdUser = JSON.parse(encryptedData);
    console.log(encryptedData);
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
  url = `https://www.playtolearn.in/Mini_games_beta/api/GetAssessmentDataList?OrgID=${ParamOrgID}&UID=${UID[0].Id_User}&M2ostAssessmentId=0&idgame=${id_game}&gameassid=${gameAssesmentId}`
) {
  try {
    const response = await fetch(url, { method: "GET" });

    // if (!response.ok) {
    // throw new Error(`Network response was not ok, status code: ${response.status}`);
    // }

    const encryptedData = await response.json();
    questionList = JSON.parse(encryptedData);
    console.log(questionList);
    //  console.log('ResponseData',questionList);
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
    // console.error('Error during initialization:', error.message);
  }
}

let getResponse;

async function saveAssessment(data) {
  let postData = data;

  const baseUrl = "https://www.playtolearn.in/";
  const endpoint = "Mini_games_beta/api/assessmentdetailuserlog";
  const url = baseUrl + endpoint;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any additional headers if required
    },
    body: JSON.stringify(postData),
  });

  // if (!response.ok) {
  // throw new Error(`Network response was not ok, status code: ${response.status}`);
  // }
  console.log("response", response);
  const responseData = await response.json();

  return responseData;
}
async function saveAssessmentMasterLog(data) {
  let postData = data;
  console.log(JSON.stringify(postData));

  const baseUrl = "https://www.playtolearn.in/";
  const endpoint = "Mini_games_beta/api/gameusermasterlog";
  const url = baseUrl + endpoint;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any additional headers if required
    },
    body: JSON.stringify(postData),
  });

  // if (!response.ok) {
  // throw new Error(`Network response was not ok, status code: ${response.status}`);

  // }
  // console.log('response',response);
  const responseData = await response.json();

  return responseData;
}

const sound = new Audio("assets/smash.mp3");

function startGame() {
  document.querySelector(".start-page").style.display = "none";
  document.querySelector(".whack-a-mole-container").style.filter = "block";
  cursor.style.display = "block";
}

function run() {
  const i = Math.floor(Math.random() * holes.length);
  const hole = holes[i];
  let timer = null;

  const img = document.createElement("img");
  img.classList.add("mole");
  img.src = "assets/mole.png";

  img.addEventListener("click", () => {
    score += 10;
    sound.play();
    scoreEl.textContent = score;
    img.src = "assets/mole-whacked.png";
    openModal();

    clearTimeout(timer);
    setTimeout(() => {
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

run();

window.addEventListener("mousemove", (e) => {
  cursor.style.top = e.pageY + "px";
  cursor.style.left = e.pageX + "px";
});

window.addEventListener("mousedown", () => {
  cursor.classList.add("active");
});

window.addEventListener("mouseup", () => {
  cursor.classList.remove("active");
});

function openModal() {
  isGamePaused = true;
  document.getElementById("questionModal").style.display = "block";

  displayQuestion();
  clearInterval(timerInterval);
  startTimer();
}

function closeModal() {
  isGamePaused = false;
  document.getElementById("questionModal").style.display = "none";
}

closeModal();

document.getElementById("timer").innerHTML = "30 sec";

let timerInterval;

function startTimer() {
  let timer = 30;

  // Set the timer duration in seconds
  timerInterval = setInterval(() => {
    timer--;

    if (timer >= 0) {
      document.getElementById("timer").innerHTML = `${timer} Sec`;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

let index = 0;
function displayQuestion() {
  const currentQuestion = questionList[index]; // Use a different variable name to avoid conflicts
  //   console.log(currentQuestion)
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
  } else {
    // If there are no more questions, display "Game Over" message
    questionText.textContent = "Game Over. All questions displayed.";
    optionsContainer.innerHTML = ""; // Clear any previous options
    document.getElementById("continueButton").style.display = "none"; // Hide the continue button
  }
}

// Event listener for the continue button
document
  .getElementById("continueButton")
  .addEventListener("click", function () {
    const selectedOption = document.querySelector(
      'input[name="group"]:checked'
    );

    if (selectedOption) {
      const selectedOptionValue = selectedOption.value;
      closeModal();
      index++;
      displayQuestion();
      saveAssessment(selectedOptionValue);
    } else {
      document.getElementById("error-text").textContent =
        "Please select an option.";
    }
  });
  