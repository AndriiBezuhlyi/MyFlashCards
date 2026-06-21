import { getResources, postData } from './services'

const BASE_URL = 'http://localhost:3000/words'

export const wordsApi = {
	getWords() {
		return getResources(BASE_URL)
	},

	createWord(word) {
		return postData(BASE_URL, word)
	},

	async deleteWord(id) {
		const res = await fetch(`${BASE_URL}/${id}`, {
			method: 'DELETE',
		})

		if (!res.ok) {
			throw new Error('Delete failed')
		}

		return id
	},
}
