import '../sass/style.scss'
import initForm from './components/addWord'
import initStudy from './components/study'
import initTabs from './components/tabs'
import initWordsList from './components/wordsList'

window.addEventListener('DOMContentLoaded', () => {
	initTabs()
	initWordsList('.words__list')
	initForm('.addWord__form')
	initStudy()
})
