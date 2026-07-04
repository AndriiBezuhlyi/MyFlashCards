import { capitalizeFirst, lowerTrim } from '../services/services'
import { validateWordData } from '../services/wordValidation'
import wordsStore from '../store/wordsStore'
///// Що доробити потрібно:
// - фільтри по статусу,
// - можливість вибирати багато слів для видалення,
// - можливість редагувати слова,
// - адаптувати занадто довгі слова та їх значення під список щоб не ламалось нічого
class WordsList {
	constructor(
		{ id, english, translate, status },
		isEditing,
		editErrors,
		editValues,
	) {
		this.id = id
		this.english = english
		this.translate = translate
		this.status = status
		this.isEditing = isEditing
		this.editErrors = editErrors
		this.editValues = editValues
	}

	render() {
		const deleteIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M3 6H21" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		<path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		<path d="M19 6L18.2 19C18.1523 19.8284 17.4635 20.5 16.634 20.5H7.36604C6.53652 20.5 5.84768 19.8284 5.8 19L5 6" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		<path d="M10 11V17" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		<path d="M14 11V17" stroke="var(--delete)" stroke-width="1.8" stroke-linecap="round"/>
		</svg>`
		const editIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M4.75 19.25H19.25" stroke="var(--text-secondary)" stroke-width="1.25" stroke-linecap="round"/>
		<path d="M6.25 15.75L7.05 12.15C7.11 11.88 7.25 11.63 7.45 11.43L15.55 3.33C16.06 2.82 16.89 2.82 17.4 3.33L20.67 6.6C21.18 7.11 21.18 7.94 20.67 8.45L12.57 16.55C12.37 16.75 12.12 16.89 11.85 16.95L8.25 17.75C7.07 18.01 5.99 16.93 6.25 15.75Z" stroke="var(--text-secondary)" stroke-width="1.25" stroke-linejoin="round"/>
		<path d="M14.25 4.75L19.25 9.75" stroke="var(--text-secondary)" stroke-width="1.25" stroke-linecap="round"/>
		<path d="M7.25 16.75L10.65 15.95L8.05 13.35L7.25 16.75Z" fill="var(--text-secondary)"/>
		</svg>`
		const saveIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M5 12.6L9.15 16.75L19 6.75" stroke="var(--text-secondary)" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
	  </svg>`
		const cancelIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M7 7L17 17" stroke="var(--text-secondary)" stroke-width="1.35" stroke-linecap="round"/>
		<path d="M17 7L7 17" stroke="var(--text-secondary)" stroke-width="1.35" stroke-linecap="round"/>
	  </svg>`
		const elem = document.createElement('li')
		elem.classList.add('words__item')
		elem.dataset.id = this.id
		const eng = capitalizeFirst(this.english)
		const ukr = capitalizeFirst(this.translate)
		if (this.isEditing) {
			elem.innerHTML = `
		<div class="words__item-words">
		<button class="words__item-save">${saveIcon}</button>
		<button class="words__item-cancel">${cancelIcon}</button>
		<div class="words__item-wrap"> <span class="words__item-error">${this.editErrors.english}</span>
		<input class="words__item-input words__item-input--english text-md-bold" value="${this.editValues.english}"></div> <span class="words__item-slash text-md-bold">/</span> <div class="words__item-wrap"><span class="words__item-error">${this.editErrors.translate}</span>
		<input class="words__item-input words__item-input--translate text-md opacity" value="${this.editValues.translate}"></div>
		</div>
		<div class="words__item-block"><div class="words__item-status">${this.status}</div>
		<button class="words__item-delete">${deleteIcon}</button></div>`
		} else {
			elem.innerHTML = `
		<div class="words__item-words">
		<button class="words__item-edit">${editIcon}</button>
		<span class="text-md-bold">${eng}</span> / <span class="text-md opacity">${ukr}</span>
		</div>
		<div class="words__item-block"><div class="words__item-status words__item-status--${this.status}">${this.status}</div>
		<button class="words__item-delete">${deleteIcon}</button></div>`
		}

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
	const parent = document.querySelector(parentSelector)
	const searchInput = document.querySelector('.words__input')

	const info = document.createElement('div')
	info.classList.add('words__info')

	if (!parent) return

	let words = [],
		editingId = null,
		editErrors = {
			english: '',
			translate: '',
		},
		editValues = {
			english: '',
			translate: '',
		}

	function renderWords(data) {
		parent.innerHTML = ''

		if (!data.length) {
			info.innerHTML = 'Щоб бачити слова в списку, спочатку додайте їх'
			parent.appendChild(info)
			return
		}

		data.forEach(word => {
			const isEditing = String(editingId) === String(word.id)
			const card = new WordsList(word, isEditing, editErrors, editValues)
			parent.appendChild(card.render())
		})
	}

	function getFiltered(list) {
		if (!searchInput) return list

		const searchTerm = lowerTrim(searchInput.value)

		return list.filter(
			item =>
				item.english.includes(searchTerm) ||
				item.translate.includes(searchTerm),
		)
	}

	function render() {
		const filtered = getFiltered(words)

		if (filtered.length === 0 && searchInput && searchInput.value !== '') {
			parent.innerHTML = ''
			info.innerHTML = 'Таких слів не знайдено'
			parent.appendChild(info)
			updateCount(filtered)
			return
		}

		renderWords(filtered)
		updateCount(filtered)
	}

	async function deleteWord(e) {
		const deleteBtn = e.target.closest('.words__item-delete')

		if (!deleteBtn) return

		const item = deleteBtn.closest('.words__item')
		const id = item.dataset.id

		const confirmed = await showConfirm()
		if (!confirmed) return

		try {
			await wordsStore.deleteWord(id)
		} catch (error) {
			console.error('Помилка видалення:', error)
		}
	}

	async function editWords(e) {
		const editBtn = e.target.closest('.words__item-edit'),
			cancelBtn = e.target.closest('.words__item-cancel'),
			saveBtn = e.target.closest('.words__item-save')

		let activeBtn

		if (!editBtn && !cancelBtn && !saveBtn) {
			return
		}

		if (cancelBtn) {
			editingId = null
			editValues = {
				english: '',
				translate: '',
			}
			editErrors = {
				english: '',
				translate: '',
			}
			render()
			return
		}

		activeBtn = editBtn || cancelBtn || saveBtn
		const item = activeBtn.closest('.words__item')
		const id = item.dataset.id

		if (saveBtn) {
			const english = item.querySelector('.words__item-input--english')
			const translate = item.querySelector('.words__item-input--translate')

			const validationResult = validateWordData({
				english: english.value,
				translate: translate.value,
			})

			if (!validationResult.isValid) {
				editValues = {
					english: english.value,
					translate: translate.value,
				}
				editErrors = validationResult.errors
				render()
				return
			}

			try {
				await wordsStore.updateWord(id, validationResult.values)
				editingId = null
				editValues = {
					english: '',
					translate: '',
				}
				editErrors = {
					english: '',
					translate: '',
				}
				render()
				return
			} catch (error) {
				console.error(`Виникла помилка: ${error}`)
			}
		}

		if (editBtn) {
			editingId = id
			editErrors = {
				english: '',
				translate: '',
			}
			const foundWord = words.find(item => String(item.id) === String(id))

			if (!foundWord) return

			editValues = {
				english: foundWord.english,
				translate: foundWord.translate,
			}

			render()
			return
		}
	}

	parent.addEventListener('click', editWords)

	wordsStore.subscribe(newWords => {
		words = newWords
		render()
	})

	if (searchInput) {
		searchInput.addEventListener('input', render)
	}

	parent.addEventListener('click', deleteWord)

	try {
		await wordsStore.loadWords()
	} catch (error) {
		console.error('Fetch error:', error)

		parent.innerHTML = ''
		info.innerHTML = 'Помилка завантаження слів'
		parent.appendChild(info)
	}
}

export default initWordsList
