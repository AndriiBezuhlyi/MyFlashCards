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

	function renderQuestion() {
		let english = questions[currentIndex].english
		const answers = generateAnswers(questions[0])
		parent.innerHTML = ''
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
		shuffle(otherWords)

		let answers = [correct, otherWords[0].translate, otherWords[1].translate]
		shuffle(answers)
		return answers
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
