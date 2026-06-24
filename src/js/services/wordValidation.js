import { lowerTrim } from './services'

export function validateWordData(data) {
	const engReg = /^[a-zA-Z\s-]+$/,
		ukrReg = /^[а-яА-ЯґҐєЄіІїЇ,'\s-]+$/

	const minLength = 2,
		maxLength = 40

	const englishValue = lowerTrim(data.english),
		translateValue = lowerTrim(data.translate)

	const result = {
		isValid: true,
		values: {
			english: englishValue,
			translate: translateValue,
		},
		errors: {
			english: '',
			translate: '',
		},
	}

	if (englishValue === '') {
		result.errors.english = 'Поле не може бути порожнім'
		result.isValid = false
	}
	if (translateValue === '') {
		result.errors.translate = 'Поле не може бути порожнім'
		result.isValid = false
	}

	if (englishValue !== '' && englishValue.length < minLength) {
		result.errors.english = `Мінімум ${minLength} символи`
		result.isValid = false
	}
	if (translateValue !== '' && translateValue.length < minLength) {
		result.errors.translate = `Мінімум ${minLength} символи`
		result.isValid = false
	}

	if (englishValue.length > maxLength) {
		result.errors.english = `Максимум ${maxLength} символи`
		result.isValid = false
	}
	if (translateValue.length > maxLength) {
		result.errors.translate = `Максимум ${maxLength} символи`
		result.isValid = false
	}

	if (
		englishValue !== '' &&
		result.errors.english === '' &&
		!engReg.test(englishValue)
	) {
		result.errors.english = 'Only for english'
		result.isValid = false
	}
	if (
		translateValue !== '' &&
		result.errors.translate === '' &&
		!ukrReg.test(translateValue)
	) {
		result.errors.translate = 'Тільки для української'
		result.isValid = false
	}

	return result
}
