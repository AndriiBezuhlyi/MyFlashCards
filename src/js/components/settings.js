export default function initSettings() {
	const toggleBtn = document.querySelector('.settings__toggleTheme')

	toggleBtn.addEventListener('click', () => {
		toggleTheme()
	})

	const toggleTheme = () => {
		const current = document.documentElement.getAttribute('data-theme')

		const newTheme = current === 'dark' ? 'light' : 'dark'

		document.documentElement.setAttribute('data-theme', newTheme)

		localStorage.setItem('theme', newTheme)

		updateButtonText(newTheme)
	}

	const updateButtonText = theme => {
		toggleBtn.innerHTML = theme === 'dark' ? 'Light theme ☀️' : 'Dark theme 🌙'
	}

	const savedTheme = localStorage.getItem('theme')
	savedTheme === 'dark'
		? (toggleBtn.innerHTML = 'Light theme ☀️')
		: (toggleBtn.innerHTML = 'Dark theme 🌙')

	if (savedTheme) {
		document.documentElement.setAttribute('data-theme', savedTheme)
	} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		document.documentElement.setAttribute('data-theme', 'dark')
	}
}
