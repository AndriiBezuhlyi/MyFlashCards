import { lowerTrim } from '../services/services'
///// Що доробити потрібно:
// - загальна кількість слів,
// - фільтри по статусу,
// - можливість вибирати багато слів для видалення,
// - можливість редагувати слова,
// - адаптувати занадто довгі слова та їх значення під список щоб не ламалось нічого

/// ЯКЩО ПІД ЧАС ПОШУКУ ВИДАЛЯТИ ТО БАГУЄТЬСЯ І НЕ ПРОПАДАЄ З ЗАГАЛЬНОГО СПИСКУ
class WordsList {
	constructor({ id, english, translate, status }) {
		this.id = id
		this.english = english
		this.translate = translate
		this.status = status
	}

	render() {
		const deleteIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M3 6H21" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		<path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		<path d="M19 6L18.2 19C18.1523 19.8284 17.4635 20.5 16.634 20.5H7.36604C6.53652 20.5 5.84768 19.8284 5.8 19L5 6" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		<path d="M10 11V17" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		<path d="M14 11V17" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		</svg>`
		const elem = document.createElement('li')
		elem.classList.add('words__item')
		elem.dataset.id = this.id
		elem.innerHTML = `
		<div class="words__item-words">
		<span class="text-md-bold">${this.english}</span> / <span class="text-md opacity">${this.translate}</span>
		</div>
		<div class="words__item-block"><div class="words__item-status">${this.status}</div>
		<button class="words__item-delete">${deleteIcon}</button></div>`

		return elem
	}
}

function showConfirm() {
	return new Promise(resolve => {
		const modal = document.querySelector('.words__confirm-modal'),
			yesBtn = document.querySelector('.words__confirm-yes'),
			noBtn = document.querySelector('.words__confirm-no'),
			overlay = document.querySelector('.overlay')

		overlay.style.display = 'block'
		modal.style.display = 'flex'

		const onYes = () => {
			cleanUp()
			resolve(true)
		}

		const onNo = () => {
			cleanUp()
			resolve(false)
		}

		function cleanUp() {
			overlay.style.display = 'none'
			modal.style.display = 'none'
			yesBtn.removeEventListener('click', onYes)
			noBtn.removeEventListener('click', onNo)
			overlay.removeEventListener('click', onNo)
		}

		yesBtn.addEventListener('click', onYes)
		noBtn.addEventListener('click', onNo)
		overlay.addEventListener('click', onNo)
	})
}

function updateCount(data) {
	const countWords = document.querySelector('.words__count')

	if (countWords) {
		countWords.innerHTML = data.length
	}
}

async function initWordsList(parentSelector) {
	const parent = document.querySelector(parentSelector),
		searchInput = document.querySelector('.words__input')

	const info = document.createElement('div')
	info.classList.add('words__info')

	if (!parent) return

	function renderWords(data) {
		console.log('Update')
		parent.innerHTML = ''
		if (!data.length) {
			info.innerHTML = 'Щоб бачити слова в списку, спочатку додайте їх'
			parent.appendChild(info)
			return
		}

		data.forEach(word => {
			const card = new WordsList(word)
			parent.appendChild(card.render())
		})
	}

	function render() {
		const filtered = getFiltered(words)

		if (filtered.length === 0 && searchInput.value !== '') {
			parent.innerHTML = ''
			info.innerHTML = 'Таких слів не знайдено'
			parent.appendChild(info)
			return
		}

		renderWords(filtered)
		updateCount(filtered)
	}

	let data = []

	try {
		const response = await fetch('http://localhost:3000/words')

		if (!response.ok) {
			throw new Error('HTTP error')
		}

		data = await response.json()
	} catch (error) {
		console.error('Fetch error:', error)

		parent.innerHTML = ''
		info.innerHTML = 'Помилка завантаження слів'
		parent.appendChild(info)

		return
	}

	let words = data
	renderWords(words)

	function getFiltered(list) {
		const searchTerm = lowerTrim(searchInput.value)

		return list.filter(
			item =>
				item.english.includes(searchTerm) ||
				item.translate.includes(searchTerm),
		)
	}

	searchInput.addEventListener('input', render)

	parent.addEventListener('click', async e => {
		const deleteBtn = e.target.closest('.words__item-delete')

		if (!deleteBtn) return

		const item = deleteBtn.closest('.words__item')
		const id = item.dataset.id

		const confirmed = await showConfirm()
		if (!confirmed) return

		try {
			const response = await fetch(`http://localhost:3000/words/${id}`, {
				method: 'DELETE',
			})
			if (!response.ok) {
				throw new Error('Delete failed')
			}

			words = words.filter(item => item.id !== id)

			render()
		} catch (error) {
			console.error('Помилка видалення:', error)
		}
	})

	updateCount(getFiltered(words))
}

export default initWordsList
