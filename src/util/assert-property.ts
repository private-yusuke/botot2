export type PickRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

export function assertProperty<T, K extends keyof T>(
	key: K
): (value: T) => value is PickRequired<T, K> {
	return (value: T): value is PickRequired<T, K> => {
		return value instanceof Object && key in value
	}
}
