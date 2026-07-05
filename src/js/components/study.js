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
				if (item.dataset.answer === questions[currentIndex].translate) {
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
