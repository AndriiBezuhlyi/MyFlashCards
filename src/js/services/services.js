export const postData = async (url, data) => {
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!res.ok) {
		throw new Error(`Could not post ${url}, status: ${res.status}`)
	}
	return await res.json()
}

export const getResources = async url => {
	const res = await fetch(url)

	if (!res.ok) {
		throw new Error(`Could not fetch ${url}, status: ${res.status}`)
	}

	return await res.json()
}

export function lowerTrim(value) {
	return value.toLowerCase().trim()
}

export function capitalizeFirst(value) {
	if (!value) return ''

	const text = String(value).trim().toLowerCase()

	return text.charAt(0).toUpperCase() + text.slice(1)
}
