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
import { capitalizeFirst } from '../services/services'
import wordsStore from '../store/wordsStore'

export default function initStudy() {
	const parent = document.querySelector('.study')

	const initialScreenHTML = parent.innerHTML

	const warning = document.createElement('div')
	warning.classList.add('study__warning')
	warning.classList.add('card')
	const warningTimer = () => {
		setTimeout(() => {
			warning.remove()
		}, 3000)
	}

	let quantity = 25

	let questions = [],
		allWords = [],
		currentIndex = 0,
		correctAnswers = 0

	function bindStartScreenEvents() {
		const content = document.querySelector('.study__choice'),
			btns = document.querySelectorAll('.choose'),
			btnStart = document.querySelector('.study__btn')

		btns.forEach(item => {
			item.addEventListener('click', e => {
				btns.forEach(item => item.classList.remove('choose-active'))

				e.currentTarget.classList.add('choose-active')

				quantity = e.currentTarget.dataset.quantity
				quantity = Number(quantity)

				if (quantity) {
					content.innerHTML = quantity
				}
			})
		})

		if (btnStart) {
			btnStart.addEventListener('click', launchTest)
		}
	}

	bindStartScreenEvents()

	async function startStudySession(count) {
		const parent = document.querySelector('.study__choose')
		let data = wordsStore.getWords()

		if (data.length === 0) {
			await wordsStore.loadWords()
			data = wordsStore.getWords()
		}
		if (!data) {
			return
		}

		allWords = data

		if (data.length < 3) {
			warning.innerHTML = `Додайте мінімум 3 слова для тесту`
			parent.append(warning)
			warningTimer()
			return
		}
		if (data.length < quantity) {
			warning.innerHTML = `Недостатньо слів для такої кількості питань`
			parent.append(warning)
			warningTimer()
			return
		}

		questions = getWeightedQuestions(data, count)

		return questions
	}

	let isAnswered = false

	parent.addEventListener('click', async e => {
		let selectedAnswer = e.target.closest('.answer-btn'),
			answersList = document.querySelectorAll('.answer-btn')

		const btnNextTest = e.target.closest('.btn-next-test'),
			btnFirstScreen = e.target.closest('.btn-back-first')

		if (btnNextTest) {
			await launchTest()
			return
		}
		if (btnFirstScreen) {
			parent.innerHTML = initialScreenHTML

			questions = []
			allWords = []
			currentIndex = 0
			correctAnswers = 0
			isAnswered = false
			quantity = 25

			bindStartScreenEvents()
			return
		}

		if (!selectedAnswer) return
		if (isAnswered) return
		isAnswered = true

		parent.classList.add('is-answered')

		if (selectedAnswer.dataset.answer === questions[currentIndex].translate) {
			selectedAnswer.classList.add('correct')
			correctAnswers++
			await updateWordProgress(questions[currentIndex])
			setTimeout(updateQuestion, 2500)
		} else {
			answersList.forEach(item => {
				if (item.textContent.trim() === questions[currentIndex].translate) {
					item.classList.add('correct')
				}
			})
			selectedAnswer.classList.add('wrong')
			setTimeout(updateQuestion, 3000)
		}
	})

	function getStatusByRepetitions(repetitions) {
		if (repetitions >= 15) return 'learned'

		if (repetitions >= 5) return 'learning'

		return 'new'
	}

	function getWordWeight(word) {
		if (word.status === 'new') return 5
		if (word.status === 'learning') return 3
		if (word.status === 'learned') return 1

		return 1
	}

	function createWeightedPool(words) {
		const weightedPool = []

		words.forEach(word => {
			const weight = getWordWeight(word)

			for (let i = 0; i < weight; i++) {
				weightedPool.push(word)
			}
		})

		return weightedPool
	}

	function getWeightedQuestions(words, count) {
		const weightedPool = createWeightedPool(words)
		shuffle(weightedPool)

		const selectedQuestions = []
		const selectedIds = new Set()

		for (const word of weightedPool) {
			if (selectedQuestions.length >= count) break

			const id = String(word.id)

			if (selectedIds.has(id)) continue

			selectedQuestions.push(word)
			selectedIds.add(id)
		}

		return selectedQuestions
	}

	async function updateWordProgress(currentWord) {
		const words = wordsStore.getWords()
		const actualWord = words.find(
			item => String(item.id) === String(currentWord.id),
		)
		if (!actualWord) return

		const oldRepetitions = Number(actualWord.repetitions) || 0
		const newRepetitions = oldRepetitions + 1
		const newStatus = getStatusByRepetitions(newRepetitions)

		await wordsStore.updateWord(actualWord.id, {
			repetitions: newRepetitions,
			status: newStatus,
		})
	}

	function renderQuestion() {
		if (questions.length === 0 || !questions[currentIndex]) return

		const currentWord = questions[currentIndex]
		let english = capitalizeFirst(currentWord.english)
		const answers = generateAnswers(currentWord)

		if (!answers || answers.length < 3) return

		parent.innerHTML = `
          <div class="study__mode">
						<div class="study__mode-question text-lg card">${english}</div>
						<ul class="study__mode-answers">
						<li class='answer'><button class='answer-btn' data-answer="${answers[0]}">${capitalizeFirst(answers[0])}</button></li>
							<li class='answer'><button class='answer-btn' data-answer="${answers[1]}">${capitalizeFirst(answers[1])}</button></li>
							<li class='answer'><button class='answer-btn' data-answer="${answers[2]}">${capitalizeFirst(answers[2])}</button></li>
						</ul>
					</div>`
	}

	function generateAnswers(currentWord) {
		let correct = currentWord.translate
		let otherWords = allWords.filter(w => w.id !== currentWord.id)

		if (otherWords.length < 2) return

		shuffle(otherWords)

		let answers = [correct, otherWords[0].translate, otherWords[1].translate]
		shuffle(answers)
		return answers
	}

	function renderFinishScreen() {
		parent.innerHTML = `
			<div class="study__finish-screen">
			<h2 class="title-md">Тест завершено!</h2>

			<p class="text-md">
						Правильних відповідей:
							<span class="text-md-bold">${correctAnswers}</span> /
							<span class="text-md-bold">${questions.length}</span>
			</p>

			<div class="study__finish-actions">
						<button class="button btn-next-test">Розпочати наступний тест</button>
						<button class="button btn-back-first">Повернутись на початковий екран</button>
			</div>
			</div>`
	}

	function updateQuestion() {
		currentIndex++
		isAnswered = false
		parent.classList.remove('is-answered')
		if (currentIndex >= questions.length) {
			renderFinishScreen()
		} else {
			renderQuestion()
		}
	}

	async function launchTest() {
		const data = await startStudySession(quantity)

		if (!data) return

		correctAnswers = 0
		currentIndex = 0
		isAnswered = false

		renderQuestion()
	}
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))

		// swap
		;[array[i], array[j]] = [array[j], array[i]]
	}
}
