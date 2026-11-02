/* Just enough colour for the few code samples of the presentation pages. */
export function highlight(code: string) {
	return code
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(
			/('[^']*'|"[^"]*")|(\/\*.*?\*\/)|\b(import|from|let|const|new)\b|(&lt;\/?[A-Za-z][\w-]*|--[\w-]+)/g,
			(token, string, comment, keyword) => {
				const kind = string ? 'string' : comment ? 'comment' : keyword ? 'keyword' : 'tag';
				return `<span class="t-${kind}">${token}</span>`;
			}
		);
}
