/// додати: обмеження слів мінімум - 2 букви, максимум - 45 букв для англійської і для перекладу окремо 

import { postData } from '../services/services'
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
		ukrReg = /^[а-яА-ЯґҐєЄіІїЇ\s-]+$/

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
		formState.english = englishInput.value.trim()
		formState.translate = translateInput.value.trim()

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
		formState.english = englishInput.value.trim()
		validateForm()
	})
	translateInput.addEventListener('input', () => {
		formState.translate = translateInput.value.trim()
		validateForm()
	})
	englishInput.addEventListener('blur', () => {
		formState.englishTouched = true
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
