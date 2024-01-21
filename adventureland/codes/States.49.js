class State {
	constructor(name, scope) {
		this.name = name
		this.scope = scope
	}
	get name() {
		return this.namee
	}
	get scope() {
		return this.scope
	}

	save() {
		set(this.scope)
	}
	load() {
		get(this.scope)
	}
}
