import wordsStore from '../store/wordsStore'

export default function initDashboard() {
	const totalCount = document.querySelector('.dashboard__total-count'),
		newCount = document.querySelector('.dashboard__new-count'),
		learningCount = document.querySelector('.dashboard__learning-count'),
		learnedCount = document.querySelector('.dashboard__learned-count')

	if (!totalCount || !newCount || !learningCount || !learnedCount) return

	function calculateStats(words) {
		return {
			total: words.length,
			new: words.filter(item => item.status === 'new').length,
			learning: words.filter(item => item.status === 'learning').length,
			learned: words.filter(item => item.status === 'learned').length,
		}
	}

	function render(words) {
		const stats = calculateStats(words)

		totalCount.textContent = stats.total
		newCount.textContent = stats.new
		learningCount.textContent = stats.learning
		learnedCount.textContent = stats.learned
	}

	wordsStore.subscribe(render)

	render(wordsStore.getWords())
}
