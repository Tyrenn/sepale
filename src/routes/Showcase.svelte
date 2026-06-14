<script lang="ts">
	// Component galleries, mirroring the original example/ pages. Markup uses
	// the family's class names directly (the same classes the lib components
	// emit), so the preview always reflects the active family + theme.
	let { component }: { component: string } = $props();
</script>

{#if component === 'button'}
	<div class="preview">
		<button class="btn btn-xs">Xsmall</button>
		<button class="btn btn-sm">Small</button>
		<button class="btn">Medium</button>
		<button class="btn btn-lg">Large</button>
		<button class="btn btn-xl">Xlarge</button>
	</div>
	<div class="preview">
		<button class="btn btn-neutral">Neutral</button>
		<button class="btn btn-primary">Primary</button>
		<button class="btn btn-secondary">Secondary</button>
		<button class="btn btn-accent">Accent</button>
		<button class="btn btn-info">Info</button>
		<button class="btn btn-success">Success</button>
		<button class="btn btn-warning">Warning</button>
		<button class="btn btn-error">Error</button>
	</div>
	<div class="preview">
		<button class="btn btn-outline btn-primary">Outline</button>
		<button class="btn btn-dash btn-primary">Dash</button>
		<button class="btn btn-soft btn-primary">Soft</button>
		<button class="btn btn-ghost">Ghost</button>
		<button class="btn btn-link">Link</button>
	</div>
	<div class="preview">
		<button class="btn btn-active btn-primary">Active</button>
		<button class="btn btn-wide">Wide</button>
		<button class="btn" disabled>Disabled</button>
	</div>
{:else if component === 'input'}
	<div class="preview"><input type="text" class="input" placeholder="Default input" /></div>
	<div class="preview">
		<input type="text" class="input input-xs" placeholder="xs" />
		<input type="text" class="input input-sm" placeholder="sm" />
		<input type="text" class="input" placeholder="base" />
		<input type="text" class="input input-md" placeholder="md" />
		<input type="text" class="input input-lg" placeholder="lg" />
	</div>
	<div class="preview">
		<input type="text" class="input input-primary" placeholder="Primary" />
		<input type="text" class="input input-secondary" placeholder="Secondary" />
		<input type="text" class="input input-accent" placeholder="Accent" />
		<input type="text" class="input input-info" placeholder="Info" />
		<input type="text" class="input input-success" placeholder="Success" />
		<input type="text" class="input input-warning" placeholder="Warning" />
		<input type="text" class="input input-error" placeholder="Error" />
	</div>
	<div class="preview"><input type="text" class="input input-ghost" placeholder="Ghost" /></div>
	<div class="preview">
		<label class="input">
			<span class="label">https://</span>
			<input type="text" placeholder="example.com" />
		</label>
	</div>
{:else if component === 'select'}
	<div class="preview">
		<select class="select">
			<option disabled selected>Pick a color</option>
			<option>Crimson</option><option>Amber</option><option>Velvet</option>
		</select>
	</div>
	<div class="preview">
		<select class="select select-ghost"><option>Ghost</option><option>Two</option></select>
		<select class="select select-primary"><option>Primary</option><option>Two</option></select>
	</div>
	<div class="preview">
		<select class="select select-xs"><option>xs</option></select>
		<select class="select select-sm"><option>sm</option></select>
		<select class="select"><option>base</option></select>
		<select class="select select-lg"><option>lg</option></select>
		<select class="select select-xl"><option>xl</option></select>
	</div>
{:else if component === 'textarea'}
	<div class="preview"><textarea class="textarea" placeholder="Default textarea"></textarea></div>
	<div class="preview">
		<textarea class="textarea textarea-primary" placeholder="Primary"></textarea>
		<textarea class="textarea textarea-success" placeholder="Success"></textarea>
		<textarea class="textarea textarea-error" placeholder="Error"></textarea>
	</div>
	<div class="preview"><textarea class="textarea textarea-ghost" placeholder="Ghost"></textarea></div>
	<div class="preview"><textarea class="textarea" placeholder="Disabled" disabled></textarea></div>
{:else if component === 'checkbox'}
	<div class="preview">
		<input type="checkbox" checked class="checkbox checkbox-xs" />
		<input type="checkbox" checked class="checkbox checkbox-sm" />
		<input type="checkbox" checked class="checkbox" />
		<input type="checkbox" checked class="checkbox checkbox-lg" />
	</div>
	<div class="preview">
		<input type="checkbox" checked class="checkbox checkbox-primary" />
		<input type="checkbox" checked class="checkbox checkbox-secondary" />
		<input type="checkbox" checked class="checkbox checkbox-accent" />
		<input type="checkbox" checked class="checkbox checkbox-success" />
		<input type="checkbox" checked class="checkbox checkbox-warning" />
		<input type="checkbox" checked class="checkbox checkbox-error" />
	</div>
	<div class="preview">
		<input type="checkbox" checked class="checkbox checkbox-outline checkbox-primary" />
		<input type="checkbox" checked class="checkbox checkbox-square checkbox-accent" />
		<input type="checkbox" class="checkbox" disabled checked />
	</div>
{:else if component === 'radio'}
	<div class="preview">
		<input type="radio" name="rc" class="radio radio-primary" checked />
		<input type="radio" name="rc" class="radio radio-secondary" checked />
		<input type="radio" name="rc" class="radio radio-accent" checked />
		<input type="radio" name="rc" class="radio radio-success" checked />
		<input type="radio" name="rc" class="radio radio-warning" checked />
		<input type="radio" name="rc" class="radio radio-error" checked />
	</div>
	<div class="preview">
		<input type="radio" name="rs" class="radio radio-xs" checked />
		<input type="radio" name="rs" class="radio radio-sm" checked />
		<input type="radio" name="rs" class="radio" checked />
		<input type="radio" name="rs" class="radio radio-lg" checked />
	</div>
	<div class="preview">
		<input type="radio" name="rsq" class="radio radio-square radio-primary" checked />
		<input type="radio" name="rsq" class="radio radio-square radio-accent" checked />
		<input type="radio" name="rd" class="radio" disabled checked />
	</div>
{:else if component === 'toggle'}
	<div class="preview">
		<input type="checkbox" class="toggle" />
		<input type="checkbox" class="toggle" checked />
	</div>
	<div class="preview">
		<input type="checkbox" class="toggle toggle-primary" checked />
		<input type="checkbox" class="toggle toggle-secondary" checked />
		<input type="checkbox" class="toggle toggle-accent" checked />
		<input type="checkbox" class="toggle toggle-success" checked />
		<input type="checkbox" class="toggle toggle-error" checked />
	</div>
	<div class="preview">
		<input type="checkbox" class="toggle toggle-xs" checked />
		<input type="checkbox" class="toggle toggle-sm" checked />
		<input type="checkbox" class="toggle" checked />
		<input type="checkbox" class="toggle toggle-lg" checked />
	</div>
	<div class="preview">
		<input type="checkbox" class="toggle toggle-track toggle-primary" checked />
		<input type="checkbox" class="toggle toggle-track toggle-accent" checked />
		<input type="checkbox" class="toggle toggle-track toggle-success" checked />
	</div>
{:else if component === 'range'}
	<div class="preview"><input type="range" class="range" value="40" /></div>
	<div class="preview">
		<input type="range" class="range range-primary" value="60" />
		<input type="range" class="range range-secondary" value="60" />
		<input type="range" class="range range-accent" value="60" />
	</div>
	<div class="preview" style="flex-direction:column; align-items:stretch; max-width:30rem; margin:0 auto;">
		<input type="range" class="range range-xs" value="40" />
		<input type="range" class="range range-sm" value="50" />
		<input type="range" class="range" value="60" />
		<input type="range" class="range range-lg" value="80" />
	</div>
{:else if component === 'file-input'}
	<div class="preview"><input type="file" class="file-input" /></div>
	<div class="preview">
		<input type="file" class="file-input file-input-xs" />
		<input type="file" class="file-input file-input-sm" />
		<input type="file" class="file-input" />
		<input type="file" class="file-input file-input-lg" />
	</div>
	<div class="preview">
		<input type="file" class="file-input file-input-primary" />
		<input type="file" class="file-input file-input-success" />
		<input type="file" class="file-input file-input-error" />
	</div>
	<div class="preview"><input type="file" class="file-input file-input-ghost" /></div>
{:else if component === 'chip'}
	<div class="preview">
		<div class="chip chip-xs">Xsmall</div>
		<div class="chip chip-sm">Small</div>
		<div class="chip">Medium</div>
		<div class="chip chip-lg">Large</div>
	</div>
	<div class="preview">
		<div class="chip chip-primary">Primary</div>
		<div class="chip chip-secondary">Secondary</div>
		<div class="chip chip-accent">Accent</div>
		<div class="chip chip-info">Info</div>
		<div class="chip chip-success">Success</div>
		<div class="chip chip-warning">Warning</div>
		<div class="chip chip-error">Error</div>
	</div>
	<div class="preview">
		<div class="chip chip-soft chip-primary">Soft</div>
		<div class="chip chip-outline chip-primary">Outline</div>
		<div class="chip chip-dash chip-primary">Dash</div>
		<div class="chip chip-ghost">Ghost</div>
	</div>
{:else if component === 'badge'}
	<div class="preview">
		<div class="badge indicator-top indicator-end">
			<button class="btn">Notifications</button>
			<span class="chip chip-error chip-xs">99+</span>
		</div>
	</div>
	<div class="preview">
		<div class="badge indicator-top indicator-start">
			<button class="btn btn-primary">Start</button>
			<span class="chip chip-secondary chip-xs">new</span>
		</div>
		<div class="badge indicator-bottom indicator-end">
			<button class="btn">Bottom</button>
			<span class="chip chip-success chip-xs">✓</span>
		</div>
	</div>
{:else if component === 'tab'}
	<div class="preview">
		<div class="tabs tabs-border">
			<a href="#demo" class="tab tab-active">Tab 1</a>
			<a href="#demo" class="tab">Tab 2</a>
			<a href="#demo" class="tab">Tab 3</a>
		</div>
	</div>
	<div class="preview">
		<div class="tabs tabs-box">
			<a href="#demo" class="tab tab-active">Tab 1</a>
			<a href="#demo" class="tab">Tab 2</a>
			<a href="#demo" class="tab">Tab 3</a>
		</div>
	</div>
	<div class="preview">
		<div class="tabs tabs-box tabs-sm">
			<a href="#demo" class="tab tab-active">sm</a><a href="#demo" class="tab">Tab</a>
		</div>
		<div class="tabs tabs-box tabs-lg">
			<a href="#demo" class="tab tab-active">lg</a><a href="#demo" class="tab">Tab</a>
		</div>
	</div>
{:else if component === 'loading'}
	<div class="preview">
		<span class="loading loading-spinner"></span>
		<span class="loading loading-dots"></span>
		<span class="loading loading-ring"></span>
		<span class="loading loading-ball"></span>
		<span class="loading loading-bars"></span>
		<span class="loading loading-infinity"></span>
	</div>
	<div class="preview">
		<span class="loading loading-spinner loading-xs"></span>
		<span class="loading loading-spinner loading-sm"></span>
		<span class="loading loading-spinner"></span>
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if component === 'progress'}
	<div class="preview"><progress class="progress" value="40" max="100"></progress></div>
	<div class="preview" style="flex-direction:column; align-items:center;">
		<progress class="progress progress-primary" value="60" max="100"></progress>
		<progress class="progress progress-secondary" value="60" max="100"></progress>
		<progress class="progress progress-success" value="60" max="100"></progress>
		<progress class="progress progress-error" value="60" max="100"></progress>
	</div>
	<div class="preview"><progress class="progress progress-primary"></progress></div>
{:else if component === 'radial-progress'}
	<div class="preview">
		<div class="radial-progress" style="--value:25">25%</div>
		<div class="radial-progress" style="--value:50">50%</div>
		<div class="radial-progress" style="--value:75">75%</div>
		<div class="radial-progress" style="--value:100">100%</div>
	</div>
	<div class="preview">
		<div class="radial-progress radial-progress-sm" style="--value:70; color:var(--color-primary)">70%</div>
		<div class="radial-progress" style="--value:70; color:var(--color-accent)">70%</div>
		<div class="radial-progress radial-progress-lg" style="--value:70; color:var(--color-success)">70%</div>
	</div>
{:else if component === 'skeleton'}
	<div class="preview">
		<div class="skeleton" style="width:12rem; height:1rem; border-radius:4px"></div>
	</div>
	<div class="preview">
		<div style="display:flex; flex-direction:column; gap:0.5rem; width:14rem;">
			<div class="skeleton" style="width:3rem; height:3rem; border-radius:9999px"></div>
			<div class="skeleton" style="height:0.75rem; border-radius:4px"></div>
			<div class="skeleton" style="height:0.75rem; width:80%; border-radius:4px"></div>
			<div class="skeleton" style="height:0.75rem; width:65%; border-radius:4px"></div>
		</div>
	</div>
{:else if component === 'list'}
	<div class="preview">
		<div class="list" style="width:24rem; border:1px solid var(--color-base-200);">
			<div class="list-row">
				<div>
					<p style="font-weight:600;">Item title</p>
					<p style="opacity:.6; font-size:.875em;">Secondary info</p>
				</div>
				<div class="list-col-grow" style="text-align:right; opacity:.6;">Right</div>
			</div>
			<div class="list-row">
				<div>
					<p style="font-weight:600;">Another item</p>
					<p style="opacity:.6; font-size:.875em;">More info here</p>
				</div>
				<div class="list-col-grow" style="text-align:right; opacity:.6;">Value</div>
			</div>
		</div>
	</div>
	<div class="preview">
		<div class="join join-vertical" style="width:20rem;">
			<input type="text" class="input join-item" placeholder="Search fruits…" />
			<ul class="list list-suggestions join-item">
				<li class="suggestion-item suggestion-item-active">Apple</li>
				<li class="suggestion-item">Apricot</li>
				<li class="suggestion-item">Avocado</li>
			</ul>
		</div>
	</div>
{:else if component === 'text'}
	<div class="preview" style="flex-direction:column; align-items:flex-start; max-width:40rem; margin:0 auto;">
		<p class="title">Title — .title</p>
		<p class="subtitle-s1">Subtitle s1 — .subtitle-s1</p>
		<p class="subtitle-s2">Subtitle s2 — .subtitle-s2</p>
	</div>
	<div class="preview" style="flex-direction:column; align-items:flex-start; max-width:40rem; margin:0 auto;">
		<p class="text-s2-b1">text-s2-b1 — Base, semibold</p>
		<p class="text-s2-b2">text-s2-b2 — Base, medium</p>
		<p class="text-s2-b3">text-s2-b3 — Base, regular</p>
	</div>
{:else if component === 'link'}
	<div class="preview"><a class="link" href="#demo">Default link</a></div>
	<div class="preview">
		<a class="link link-primary" href="#demo">Primary</a>
		<a class="link link-secondary" href="#demo">Secondary</a>
		<a class="link link-accent" href="#demo">Accent</a>
		<a class="link link-success" href="#demo">Success</a>
		<a class="link link-error" href="#demo">Error</a>
	</div>
	<div class="preview">
		<a class="link link-hover link-primary" href="#demo">Hover only</a>
	</div>
{:else if component === 'breadcrumbs'}
	<div class="preview">
		<div class="breadcrumbs">
			<ul>
				<li><a href="#demo">Home</a></li>
				<li><a href="#demo">Documents</a></li>
				<li>Add Document</li>
			</ul>
		</div>
	</div>
{:else if component === 'dock'}
	<div class="preview">
		<div style="width:24rem; position:relative; height:5rem;">
			<div class="dock" style="position:absolute;">
				<button>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" /></svg>
					<span class="dock-label">Home</span>
				</button>
				<button class="dock-active">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" /></svg>
					<span class="dock-label">Search</span>
				</button>
				<button>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" /></svg>
					<span class="dock-label">Mail</span>
				</button>
			</div>
		</div>
	</div>
{:else if component === 'join'}
	<div class="preview">
		<div class="join">
			<button class="btn join-item">Left</button>
			<button class="btn join-item btn-primary">Center</button>
			<button class="btn join-item">Right</button>
		</div>
	</div>
	<div class="preview">
		<div class="join">
			<input type="text" class="input join-item" placeholder="Search…" />
			<button class="btn btn-primary join-item">Go</button>
		</div>
	</div>
	<div class="preview">
		<div class="join join-vertical">
			<button class="btn join-item">Top</button>
			<button class="btn join-item btn-primary">Middle</button>
			<button class="btn join-item">Bottom</button>
		</div>
	</div>
{:else if component === 'validator'}
	<div class="preview" style="flex-direction:column; align-items:center; gap:1rem;">
		<fieldset class="fieldset" style="width:20rem;">
			<legend class="fieldset-legend">Email</legend>
			<input type="email" required class="input validator" placeholder="name@example.com" />
			<p class="validator-hint">Enter a valid email address</p>
		</fieldset>
		<fieldset class="fieldset" style="width:20rem;">
			<legend class="fieldset-legend">Required field</legend>
			<input type="text" required minlength="3" class="input validator" placeholder="Min 3 chars" />
			<p class="validator-hint">At least 3 characters required</p>
		</fieldset>
	</div>
{:else}
	<p>Unknown component.</p>
{/if}
