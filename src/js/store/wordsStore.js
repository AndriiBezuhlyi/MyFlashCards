import { wordsApi } from '../services/wordsAPI'

let words = []
let subscribers = []

function notify() {
	subscribers.forEach(callback => callback(words))
}

const wordsStore = {
	getWords() {
		return words
	},

	subscribe(callback) {
		subscribers.push(callback)

		return () => {
			subscribers = subscribers.filter(item => item !== callback)
		}
	},

	async loadWords() {
		words = await wordsApi.getWords()
		notify()
	},

	async addWord(word) {
		const newWord = await wordsApi.createWord(word)

		words = [...words, newWord]

		notify()

		return newWord
	},

	async deleteWord(id) {
		await wordsApi.deleteWord(id)

		words = words.filter(word => word.id !== id)

		notify()
	},
}

export default wordsStore
