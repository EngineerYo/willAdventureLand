const {UTILS} = require_code('UTILS')

class Interface {
	constructor() {
		this.members = []
		this.classes = []
		this.data = null

		this._strategy = null

		this.init()
	}

	add_character(character_name) {
		let character = get_player(character_name)

		this.members.push(character.name)

		this.classes.push(character.ctype)
		this.classes.sort()

		this.data = {
			hp: character.hp,
			mp: character.mp,
			max_hp: character.max_hp,
			max_mp: character.max_mp,
			class: character.ctype,
		}
	}

	init() {
		this.add_character(character.name)
		this.strategy = this.classes.join('')
	}
	set strategy(strategy) {
		if (!Strategies[strategy]) return
		this._strategy = new Strategies[strategy]({
			data: this.data,
			classes: this.classes,
			members: this.members,
		})
	}
	get strategy() {
		return this._strategy
	}

	set directive(directive) {
		this.strategy.directive = directive
	}
	get directive() {
		return this.strategy.directive
	}

	run() {
		this.strategy.run()
	}
}

class Strategy {
	constructor(scope) {
		let {data, classes, members} = scope
		this.data = data
		this.classes = classes
		this.members = members
		this.characters = members.map((member) => get_player(member))
	}
	set directive(directive) {
		this._directive = new Directives[directive]({
			data: this.data,
			classes: this.classes,
			members: this.members,
			characters: this.characters,
		})
	}
	get directive() {
		return this._directive
	}

	move(location) {
		smart_move(location)
	}
}
const Strategies = {
	magepriestranger: class magepriestranger extends Strategy {
		constructor(scope) {
			super(scope)
		}
		run() {
			let directive_scope = this.directive.run({
				data: this.data,
				classes: this.classes,
				members: this.members,
				characters: this.characters,
			})

			let {location} = directive_scope
		}
	},
	ranger: class ranger extends Strategy {
		constructor(scope) {
			super(scope)
		}
		run(scope) {
			let directive_scope = this.directive.run({
				data: this.data,
				classes: this.classes,
				members: this.members,
				characters: this.characters,
			})

			let {location, area, mtype} = directive_scope
			// Do a check to see if we're within range of boundary?
			let in_boundary = UTILS.in_boundary(
				character,
				area.boundary,
				character.range
			)
			if (!in_boundary) this.move(location)

			let entities = parent.entities
			let monsters_in_area = []
			let party_targetted = {}
			for (let [name, entity] of Object.entries(parent.entities)) {
				// Least expensive checks first
				if (entity.mtype != mtype) continue
				if (!UTILS.in_boundary(entity, area, 100)) continue

				monsters_in_area.push(entity)
				if (this.members.includes(entity.target)) {
					if (!party_targetted) party_targetted[entity.target] = []
					party_targetted[entity.target].push(entity)
					party_targetted[entity.target].sort((s) => s.hp)
				}
			}
			monsters_in_area.sort((s) => s.hp)

			switch (character.ctype) {
				case 'ranger':
					// Decide whether to get mana or get hp
					if (this.hp < this.max_hp / 2) use_skill('regen_hp')
					else if (this.mp < this.max_mp) use_skill('regen_mp')

					// Hit anything targetting us. Otherwise, hit the furthest enemy in the Directive
					if (
						party_targetted[character.name] &&
						party_targetted[character.name].length > 0
					) {
						change_target(party_targetted[character.name][0])
					}
					// Find furthest target in range, or closest target out of range
					else {
						let target = monsters_in_area.sort((s) =>
							Math.abs(character.range - distance(s, character))
						)
						if (target) change_target(target)
					}

					if (!target) return
					if (!is_in_range(target) {
						
					})
					attack(target)
			}
		}
	},
}

class Directive {
	constructor(scope) {
		let {data, classes, members, characters} = scope

		this.data = data
		this.classes = classes
		this.members = members
		this.characters = characters

		return this
	}
	run() {
		loot()
	}
}
const Directives = {
	goo: class goo extends Directive {
		constructor(scope) {
			super(scope)

			this.area = G.maps['main'].monsters.find((area) => area.type == 'goo')
			this.location = {map: 'main', x: 0, y: 800}
			this.mtype = 'goo'

			return this
		}

		run() {
			super.run()
			let out_scope = {
				location: this.location,
				area: this.area,
				mtype: this.mtype,
			}

			return out_scope
		}
	},
}

const AttackStrategies = {

}

module = {
	exports: {
		Interface,
		Strategies,
		Directives,
	},
}
