const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const quizEl = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");

let cocktails = [];
let currentQuestionIndex = 0;
let score = 0;

startBtn.addEventListener("click", async () => {
  startBtn.classList.add("hidden");
  quizEl.classList.remove("hidden");
  await fetchCocktails();
  showQuestion();
});

async function fetchCocktails() {
  try {
    const res = await fetch("https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Alcoholic");
    const data = await res.json();
    cocktails = data.drinks.slice(0, 10);
  } catch (err) {
    questionEl.textContent = "Error loading data.";
  }
}

function showQuestion() {
  resetState();
  const current = cocktails[currentQuestionIndex];
  questionEl.textContent = `Which cocktail is called: "${current.strDrink}"?`;

  const correct = current.strDrink;
  const options = generateOptions(correct);

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("answer-btn");
    if (opt === correct) btn.dataset.correct = true;
    btn.addEventListener("click", selectAnswer);
    answersEl.appendChild(btn);
  });
}

function generateOptions(correct) {
  const opts = [correct];
  while (opts.length < 4) {
    const rand = cocktails[Math.floor(Math.random() * cocktails.length)].strDrink;
    if (!opts.includes(rand)) opts.push(rand);
  }
  return opts.sort(() => Math.random() - 0.5);
}

function selectAnswer(e) {
  const correct = e.target.dataset.correct === "true";
  if (correct) score++;

  Array.from(answersEl.children).forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.correct) {
      btn.classList.add("correct");
    } else {
      btn.classList.add("incorrect");
    }
  });

  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < cocktails.length) {
    showQuestion();
  } else {
    showResults();
  }
});

function resetState() {
  nextBtn.classList.add("hidden");
  answersEl.innerHTML = "";
}

function showResults() {
  questionEl.textContent = `🎉 Quiz Complete! You scored ${score}/${cocktails.length}`;
  answersEl.innerHTML = "";
  nextBtn.classList.add("hidden");
}


