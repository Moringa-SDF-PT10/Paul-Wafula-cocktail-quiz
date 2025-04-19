const quizContent = document.getElementById("quiz-content");
const startBtn = document.getElementById("start-btn");
const categorySelect = document.getElementById("category");

let score = 0;
let questionCount = 0;
let timerInterval;
let timeLeft = 15;
let totalTime = 0;
const maxQuestions = 5;

startBtn.addEventListener("click", () => {
  score = 0;
  questionCount = 0;
  totalTime = 0;
  nextQuestion();
});

function startTimer(callback) {
  clearInterval(timerInterval);
  timeLeft = 15;
  const timerEl = document.createElement('div');
  timerEl.id = 'timer';
  quizContent.prepend(timerEl);
  timerInterval = setInterval(() => {
    timerEl.textContent = `⏱ Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      callback();
    }
    timeLeft--;
    totalTime++;
  }, 1000);
}

async function nextQuestion() {
  questionCount++;
  if (questionCount > maxQuestions) return showFinalScore();
  const selectedCategory = categorySelect.value;
  quizContent.innerHTML = '<p>Loading question...</p>';
  const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
  const data = await res.json();
  const drink = data.drinks[0];
  let question = '', options = [], correctAnswer = '';

  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    if (ing) ingredients.push(ing);
  }

  switch (selectedCategory) {
    case 'ingredients': {
      const fake = await getFakeIngredient(ingredients);
      options = shuffleArray([...ingredients.slice(0, 3), fake]);
      correctAnswer = fake;
      question = `Which ingredient is NOT in a ${drink.strDrink}?`;
      break;
    }
    case 'glass': {
      const allGlasses = ['Cocktail glass', 'Highball glass', 'Old-fashioned glass', 'Collins glass'];
      correctAnswer = drink.strGlass;
      options = shuffleArray([correctAnswer, ...allGlasses.filter(g => g !== correctAnswer).slice(0, 3)]);
      question = `Which glass is used for ${drink.strDrink}?`;
      break;
    }
    case 'alcoholic': {
      const allOptions = ['Alcoholic', 'Non alcoholic', 'Optional alcohol'];
      correctAnswer = drink.strAlcoholic;
      options = shuffleArray(allOptions);
      question = `Is ${drink.strDrink} alcoholic?`;
      break;
    }
    case 'image': {
      correctAnswer = drink.strDrink;
      const drinkNames = [correctAnswer];
      for (let i = 0; i < 3; i++) {
        const fakeDrink = await getRandomDrink();
        drinkNames.push(fakeDrink.strDrink);
      }
      options = shuffleArray(drinkNames);
      question = `Which cocktail is this?`;
      break;
    }
  }

  setTimeout(() => {
    let imgHTML = '';
    if (selectedCategory === 'glass' && drink.strGlass) {
      imgHTML = `<p><img src="https://www.thecocktaildb.com/images/media/drink/${drink.strGlass.replace(/ /g, '_').toLowerCase()}.png" class="glass-icon" onerror="this.style.display='none';"></p>`;
    }
    if (selectedCategory === 'image') {
      imgHTML = `<p><img src="${drink.strDrinkThumb}" class="drink-thumb"></p>`;
    }

    quizContent.innerHTML = `
      ${imgHTML}
      <h2>${question}</h2>
      ${options.map(opt => `<div class="option" onclick="checkAnswer('${opt}', '${correctAnswer}')">${opt}</div>`).join('')}
      <p>Question ${questionCount} of ${maxQuestions}</p>
      <button onclick="nextQuestion()">Next Question</button>
    `;

    startTimer(() => {
      alert('⏰ Time is up!');
      nextQuestion();
    });
  }, 500);
}

async function getFakeIngredient(realIngredients) {
  const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list');
  const data = await res.json();
  const allIngredients = data.drinks.map(d => d.strIngredient1);
  let fake;
  do {
    fake = allIngredients[Math.floor(Math.random() * allIngredients.length)];
  } while (realIngredients.includes(fake));
  return fake;
}

async function getRandomDrink() {
  const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
  const data = await res.json();
  return data.drinks[0];
}

function checkAnswer(selected, correct) {
  clearInterval(timerInterval);
  if (selected === correct) {
    score++;
    alert("Correct! 🎉");
  } else {
    alert(`Wrong! Correct answer was: ${correct}`);
  }
}

function showFinalScore() {
  quizContent.innerHTML = `
    <h2>Your score: ${score}/${maxQuestions}</h2>
    <p>Total time: ${totalTime} seconds</p>
    <button onclick="location.reload()">Restart Quiz</button>
  `;
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

