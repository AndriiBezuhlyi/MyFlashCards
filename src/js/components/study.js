/// Додати:
// 1 - Скелетна анімація (Skeleton Loaders): Оскільки ти використовуєш fetch, додавання контенту може займати час. Поки дані вантажаться, замість порожнього екрана можна показувати сірі блоки-заглушки, що імітують форму кнопок.

// 2 - Індикатор прогресу: Коли людина проходить тест на 25 питань, їй важливо бачити, де вона зараз (наприклад, "12 з 25") або прогрес-бар зверху.

// 3 - Обробка помилок (Error Handling): Зараз, якщо сервер localhost:3000 впаде, функція просто мовчки припинить роботу через if (!response.ok) return. Краще вивести повідомлення: "Упс, не вдалося завантажити слова".

// 4 - Відокремлення "чистої" логіки від DOM: Зараз функція generateAnswers знає про структуру об'єктів у масиві questions. На майбутнє старайся робити такі функції максимально незалежними. Передавай їй тільки те, що їй треба (масив всіх слів і правильне слово), щоб вона могла працювати в будь-якому іншому проєкті без змін.

// 5 - Динамічне створення елементів vs innerHTML: innerHTML — це швидко, але він змушує браузер повністю перепаршувати весь блок. Для невеликих ігор це ок, але професійним стандартом вважається створення елементів через document.createElement або використання template. Це безпечніше (XSS захист) і продуктивніше.

// 6 - Константи для конфігурації: Час очікування (2500 та 3000 мс) краще винести в окремі константи на початку файлу. Це дозволить змінити швидкість гри в одному місці, не вишукуючи цифри по всьому коду.

// 7 - Збереження стану (State Management): У тебе зараз змінні questions, currentIndex, isAnswered розкидані по всьому модулю. В майбутньому ти можеш спробувати об'єднати їх в один об'єкт state. Це підготує тебе до роботи з Redux або React State, де весь стан додатка — це одна зрозуміла структура.

// 8 - Оптимізація fetch: Ти завантажуєш усі слова кожного разу, коли натискається "Start". Якщо користувач натисне кнопку 10 разів — буде 10 запитів. Можна додати перевірку: якщо масив data вже завантажений, брати його з пам'яті, а не йти на сервер знову.

// 9 - Керування клавіатурою: Додай можливість обирати відповіді цифрами 1, 2, 3 на клавіатурі. Це дрібниця, яка робить додаток набагато зручнішим.

// 10 - LocalStorage: Додай збереження "Рекорду" (Streak). Скільки правильних відповідей поспіль дав користувач. Навіть після закриття вкладки ці дані мають залишатися.

// 11 - Звукові ефекти: Короткий приємний "дінь" при правильній відповіді та легка вібрація (якщо це мобільний) при помилці дуже сильно міняють відчуття від гри.

// 12 - Адаптивність (Mobile First): Переконайся, що grid або flex для кнопок відповідей не з'їжджає, якщо переклад слова буде дуже довгим.

export default function initStudy() {
	const content = document.querySelector('.study__choice'),
		btns = document.querySelectorAll('.choose')

	let quantity = 25

	btns.forEach(item => {
		item.addEventListener('click', e => {
			btns.forEach(item => item.classList.remove('choose-active'))

			e.currentTarget.classList.add('choose-active')

			quantity = e.currentTarget.dataset.quantity

			if (quantity) {
				content.innerHTML = quantity
			}
		})
	})

	const btnStart = document.querySelector('.study__btn'),
		parent = document.querySelector('.study')

	let questions = [],
		currentIndex = 0

	async function startStudySession(count) {
		const response = await fetch('http://localhost:3000/words')
		if (!response.ok) return

		const data = await response.json()
		const shuffled = [...data]
		shuffle(shuffled)

		return (questions = shuffled.slice(0, count))
	}

	let isAnswered = false

	parent.addEventListener('click', e => {
		let selectedAnswer = e.target.closest('.answer-btn'),
			answersList = document.querySelectorAll('.answer-btn')
		if (!selectedAnswer) return
		if (isAnswered) return
		isAnswered = true

		parent.classList.add('is-answered')

		if (selectedAnswer.textContent === questions[currentIndex].translate) {
			selectedAnswer.classList.add('correct')
			setTimeout(updateQuestion, 2500)
			console.log(true)
		} else {
			answersList.forEach(item => {
				if (item.textContent.trim() === questions[currentIndex].translate) {
					item.classList.add('correct')
				}
			})
			selectedAnswer.classList.add('wrong')
			setTimeout(updateQuestion, 3000)
			console.log(false)
		}
	})

	function renderQuestion() {
		const currentWord = questions[currentIndex]
		let english = currentWord.english
		const answers = generateAnswers(currentWord)
		parent.innerHTML = `
          <div class="study__mode">
						<div class="study__mode-question text-lg card">${english}</div>
						<ul class="study__mode-answers">
						<li class='answer'><button class='answer-btn'>${answers[0]}</button></li>
							<li class='answer'><button class='answer-btn'>${answers[1]}</button></li>
							<li class='answer'><button class='answer-btn'>${answers[2]}</button></li>
						</ul>
					</div>`

		console.log(answers)
	}

	function generateAnswers(currentWord) {
		if (!questions || questions.length === 0) {
			console.log('questions ще порожні')
			return
		}
		let correct = currentWord.translate
		let otherWords = questions.filter(w => w.id !== currentWord.id)
		if (otherWords.length < 2) {
			console.warn('Недостатньо варіантів для запитання')
			return [correct]
		}
		shuffle(otherWords)

		let answers = [correct, otherWords[0].translate, otherWords[1].translate]
		shuffle(answers)
		return answers
	}

	function updateQuestion() {
		currentIndex++
		isAnswered = false
		parent.classList.remove('is-answered')
		if (currentIndex >= questions.length) {
			parent.innerHTML = `
			<div class="study__finish-screen">
			<h2 class="title-md">You finished, good job!</h2>
			<button class="button btn-restart">Restart test</button></div>`
		} else {
			renderQuestion()
		}
	}

	btnStart.addEventListener('click', async () => {
		const data = await startStudySession(quantity)
		currentIndex = 0
		renderQuestion()
	})
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))

		// swap
		;[array[i], array[j]] = [array[j], array[i]]
	}
}
