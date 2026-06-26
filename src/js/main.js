import '../sass/style.scss'
import initForm from './components/addWord'
import initDashboard from './components/dashboard'
import initSettings from './components/settings'
import initStudy from './components/study'
import initTabs from './components/tabs'
import initWordsList from './components/wordsList'

window.addEventListener('DOMContentLoaded', () => {
	initTabs()
	initDashboard()
	initWordsList('.words__list')
	initForm('.addWord__form')
	initStudy()
	initSettings()
})
