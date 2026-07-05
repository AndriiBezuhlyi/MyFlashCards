import { lowerTrim } from '../services/services'
import { validateWordData } from '../services/wordValidation'
import wordsStore from '../store/wordsStore'

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
		const validationResult = validateWordData({
			english: englishInput.value,
			translate: translateInput.value,
		})

		formState.english = lowerTrim(englishInput.value)
		formState.translate = lowerTrim(translateInput.value)

		if (formState.englishTouched) {
			errorEnglish.textContent = validationResult.errors.english
		} else {
			errorEnglish.textContent = ''
		}
		if (formState.translateTouched) {
			errorTranslate.textContent = validationResult.errors.translate
		} else {
			errorTranslate.textContent = ''
		}

		formState.isValid = validationResult.isValid
		addButton.disabled = !validationResult.isValid
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

			formState.englishTouched = true
			formState.translateTouched = true
			validateForm()

			if (formState.isValid === false) return

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

			wordsStore
				.addWord(obj)
				.then(data => {
					statusMessage.remove()
					showMessage(message.success)
				})
				.catch(error => {
					statusMessage.remove()
					showMessage(message.failure)
					console.error(error)
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
