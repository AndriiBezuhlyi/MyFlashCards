export default function initStudy() {
	const content = document.querySelector('.study__choice'),
		btns = document.querySelectorAll('.choose')

	let quantity

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
		parent = document.querySelector('.study'),
		questions = []

	function startStudy() {
		parent.innerHTML = `
          <div class="study__mode">
						<div class="study__mode-question text-lg card">Debate</div>
						<ul class="study__mode-answers">
							<li class='answer'><button class='answer-btn'>Дискусія</button></li>
							<li class='answer'><button class='answer-btn'>Дебіл</button></li>
							<li class='answer'><button class='answer-btn'>Розмова</button></li>
						</ul>
					</div>`
	}

	async function startStudySession(count) {
		const response = await fetch('http://localhost:3000/words')
		if (!response.ok) return

		const data = await response.json()
		const shuffled = [...data]
		shuffle(shuffled)

		questions = shuffled.slice(0, count)
	}

	btnStart.addEventListener('click', () => {
		parent.innerHTML = ''
		startStudy()
		startStudySession(quantity)
	})
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))

		// swap
		;[array[i], array[j]] = [array[j], array[i]]
	}
}
