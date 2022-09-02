export type PickRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Type argument K must be a literal type representing exactly one key given to `key`.
 * Normally, the type arguments for this function should be left to type inference rather than being typed in manually.
 * @param key - a key of property in type T
 * @returns A assertion function that checks if a value of type T has the property of `key`
 */
export function assertProperty<T, K extends keyof T>(
	key: K
): (value: T) => value is PickRequired<T, K> {
	return (value: T): value is PickRequired<T, K> => {
		return value instanceof Object && key in value
	}
}
