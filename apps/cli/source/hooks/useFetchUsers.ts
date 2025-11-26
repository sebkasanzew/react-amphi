import { useQuery } from '@tanstack/react-query'

// Sample user data type (from JSONPlaceholder API)
export interface User {
	id: number
	name: string
	username: string
	email: string
	phone: string
	website: string
	address: {
		street: string
		suite: string
		city: string
		zipcode: string
	}
	company: {
		name: string
		catchPhrase: string
	}
}

// Flattened user for table display
export interface FlatUser {
	id: number
	name: string
	username: string
	email: string
	phone: string
	city: string
	company: string
}

async function fetchUsers(): Promise<User[]> {
	// Fetch from local JSON file served by Next.js
	const response = await fetch('http://localhost:3000/users.json')
	if (!response.ok) {
		throw new Error('Failed to fetch users')
	}
	return response.json()
}

export function useFetchUsers() {
	return useQuery({
		queryKey: ['users'],
		queryFn: fetchUsers,
		select: (data): FlatUser[] =>
			data.map((user) => ({
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email,
				phone: user.phone,
				city: user.address.city,
				company: user.company.name,
			})),
	})
}
