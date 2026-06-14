/** Join truthy class fragments into a single class string. */
export function cx(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(' ');
}

/** Build a modifier class `${prefix}-${value}` when value is set. */
export function mod(prefix: string, value?: string | false | null): string {
	return value ? `${prefix}-${value}` : '';
}
