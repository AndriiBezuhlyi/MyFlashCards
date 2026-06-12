/// додати:
// 1 - обмеження слів мінімум - 2 букви, максимум - 45 букв для англійської і для перекладу окремо
// 2 - Trim при сабміті: Ти вже робиш .trim() у валідації, але переконайся, що в об'єкт obj, який іде на сервер, потрапляють саме обрізані дані. Іноді люди випадково ставлять пробіл в кінці, і це псує сортування в базі
// 3 - Автоматичне виправлення (Auto-correction): Можна додати автоматичне перетворення першої літери на велику (Capitalize) або просто приводити все до нижнього регістру (toLowerCase()), щоб у списку слів не було "Apple", "apple" і "APPLE" як три різні записи
// 4 - Throttle / Debounce: Якщо ти захочеш додати перевірку "чи є таке слово вже в базі" через fetch під час введення, обов'язково використовуй debounce. Це вбереже твій сервер від 10 запитів на секунду, поки юзер друкує слово
// 5 - Архітектурна "фішка": Об'єкт помилок. Зараз у тебе багато if. Коли перевірок стане більше (наприклад, заборона цифр, спецсимволів тощо), код стане важко читати. Порада: Створи об'єкт зі схемами валідації. Це зробить функцію validateForm набагато чистішою.

import { lowerTrim, postData } from '../services/services'
import initWordsList from './wordsList'

export default function initForm(formSelector) {
	const forms = document.querySelectorAll(formSelector)

	const message = {
		loading: '/img/spinner.svg',
		success: 'Word added successfully',
		failure: 'Failed...',
	}

	forms.forEach(item => {
		bindPostData(item)
	})

	const englishInput = document.getElementById('english-word'),
		translateInput = document.getElementById('translate-word'),
		addButton = document.getElementById('add-word-btn'),
		errorEnglish = document.getElementById('error-english'),
		errorTranslate = document.getElementById('error-translate')

	const engReg = /^[a-zA-Z\s-]+$/,
		ukrReg = /^[а-яА-ЯґҐєЄіІїЇ,'\s-]+$/

	if (!englishInput || !translateInput || !addButton) {
		console.error('Не знайдено елементи форми! Перевір id в HTML')
		return
	}

	let formState = {
		english: '',
		translate: '',
		englishTouched: false,
		translateTouched: false,
		isValid: false,
	}

	function validateForm() {
		formState.english = lowerTrim(englishInput.value)
		formState.translate = lowerTrim(translateInput.value)

		errorEnglish.textContent = ''
		errorTranslate.textContent = ''

		let isValid = true

		if (formState.english === '') {
			isValid = false
		}
		if (formState.translate === '') {
			isValid = false
		}

		if (formState.english === '' && formState.englishTouched) {
			errorEnglish.textContent = 'Поле не може бути порожнім'
			isValid = false
		}
		if (formState.translate === '' && formState.translateTouched) {
			errorTranslate.textContent = 'Поле не може бути порожнім'
			isValid = false
		}

		if (formState.english !== '' && !engReg.test(formState.english)) {
			errorEnglish.textContent = 'Only for english'
			isValid = false
		}
		if (formState.translate !== '' && !ukrReg.test(formState.translate)) {
			errorTranslate.textContent = 'Тільки для української'
			isValid = false
		}

		formState.isValid = isValid
		addButton.disabled = !isValid
	}

	englishInput.addEventListener('input', () => {
		formState.english = lowerTrim(englishInput.value)
		validateForm()
	})
	englishInput.addEventListener('blur', () => {
		formState.englishTouched = true
		validateForm()
	})
	englishInput.addEventListener('keydown', e => {
		if (e.key === 'Enter') {
			e.preventDefault()
			translateInput.focus()
		}
	})
	translateInput.addEventListener('input', () => {
		formState.translate = lowerTrim(translateInput.value)
		validateForm()
	})
	translateInput.addEventListener('blur', () => {
		formState.translateTouched = true
		validateForm()
	})

	validateForm()

	function bindPostData(form) {
		form.addEventListener('submit', e => {
			e.preventDefault()

			const statusMessage = document.createElement('img')
			statusMessage.src = message.loading
			statusMessage.style.cssText = `
			display: block;
			margin: 0 auto;
			`

			form.insertAdjacentElement('afterend', statusMessage)

			const formData = new FormData(form)

			const obj = Object.fromEntries(formData.entries())

			obj.english = lowerTrim(obj.english)
			obj.translate = lowerTrim(obj.translate)
			obj.status = 'new'
			obj.repetitions = 0

			const json = JSON.stringify(obj)

			formState.englishTouched = true
			formState.translateTouched = true
			if (formState.isValid) {
				postData('http://localhost:3000/words', json)
					.then(data => {
						initWordsList('.words__list')
						console.log(data)
						statusMessage.remove()
						showMessage(message.success)
					})
					.catch(error => {
						showMessage(message.failure)
					})
					.finally(() => {
						form.reset()
						englishInput.focus()
						formState.english = ''
						formState.translate = ''
						formState.englishTouched = false
						formState.translateTouched = false
						formState.isValid = false
						validateForm()
					})
			}
		})
	}

	function showMessage(message) {
		const blockShowMessage = document.querySelector('.addWord__message')

		blockShowMessage.style.display = 'flex'

		blockShowMessage.innerHTML = `${message}`

		setTimeout(() => {
			blockShowMessage.style.display = 'none'
		}, 3000)
	}
}
