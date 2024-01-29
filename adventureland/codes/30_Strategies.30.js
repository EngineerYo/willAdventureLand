const { GLOBAL_PRIORITY } = require_code(98)
const { ms_to_next_skill: ms_skill, in_boundary } = require_code(2)

class Strategy {
	constructor() {
		this.targets = []
		this.intervals = {}

		this.query = get('t_query') || get('query')

		this.states = ['travel', 'attack']
		this.state = 'travel'

		return this
	}

	set_state(to) {
		if (!this.states.includes(to)) {
			console.warn(`${to} is not a valid state`)
			return false
		}

		for (let interval_idx in this.intervals) {
			clearTimeout(this.intervals[interval_idx])
		}

		this.state = to
		this.run()
		return to
	}

	async travel() {
		if (at_destination()) this.set_state('attack')

		// FIGURE OUT WHERE TO SMART MOVE TO
		let move_res = await smart_move(destination)
		if (move_res?.success) this.set_state('attack')
	}
	async attack() {
		loot()
		try {
			const attack_skill = this.select_attack()
			const targets = this.get_target()

			await use_skill(attack_skill, ...targets)
			this.intervals['attack'] = setTimeout(this.run.bind(this), 1000 / character.frequency)
		}
		catch (e) {
			let ms_to = 1000
			if (e?.response == 'cooldown') ms_to = e.ms

			this.intervals['attack'] = setTimeout(this.run.bind(this), 1000)
			console.warn(e)
		}
	}

	async run() {
		try {
			this[this.state]
		}
		catch (e) {
			console.warn(e)
		}

	}

	/**
	 * @param destination A boundary object returned from monster_lookup
	 */
	at_destination(destination = this.query) {
		if (destination.map != character.map) return false
		if (in_boundary(character, destination, character.range / 2)) return true
		return false
	}

	travel(destination) {
		return smart_move(destination)
	}


	// DO-ER FUNCTIONS
	get_target() {
		var priority_list = [...GLOBAL_PRIORITY, get('query')]
		// Do we already have a target?
		let target = get_targeted_monster()

		if (!target || !is_in_range(target, 'attack')) {
			let potential_targets = Object.values(parent.entities)
				.filter(m => m.type == 'monster')

			// Is anyone targetting a difficult enemy?
			const party_members = Object.keys(get_party())
			const party_targets = potential_targets
				.filter(m => m.hp > character.attack)
				.filter(m => party_members.includes(m.target))
				.sort(m => distance(character, m))

			if (party_targets.length) return party_targets
			else {
				// If nobody else has a target, choose a new one
				let target_list = potential_targets
					.filter(m => priority_list.includes(m.mtype))
					.filter(m => distance(character, m) < character.range + character.xrange)
					.sort((a, b) => {
						let ap = priority_list.findIndex(s => s == a['mtype'])
						let bp = priority_list.findIndex(s => s == b['mtype'])
						if (ap == bp) return 0
						else if (ap < bp) return -1
						else if (ap > bp) return 1
					})

				this.targets = target_list
				return target_list
			}
		}

	}
	select_attack() {
		return 'attack'
	}
	travel() {
		if (smart.moving || (smart.searching && !smart.found)) return false

		if (distance(character, spot) > 10 && !can_move_to(spot.x, spot.y)) {
			smart_move({ x: spot.x, y: spot.y, map: spot.map })
		}
		else if (distance(character, spot) > 10 && can_move_to(spot.x, spot.y)) {
			if (smart.moving) use_skill('stop')
			move(spot.x, spot.y)
		}
	}
	regen_mp() {
		try {
			// Should we use a potion?
			if (character.mp + 500 < character.max_mp && locate_item('mpot1') !== -1) {
				use_skill('use_mp')
				setTimeout(this.regen_mp.bind(this), G.skills['use_mp'].cooldown)
			}
			else if (character.mp + 100 < character.max_mp) {
				use_skill('regen_mp')
				setTimeout(this.regen_mp.bind(this), G.skills['use_mp'].cooldown * G.skills['regen_mp'].cooldown_multiplier)
			}
			else {
				setTimeout(this.regen_mp.bind(this), 1000)
			}
		}
		catch (e) {
			if (e?.response == 'cooldown') setTimeout(this.regen_mp.bind(this), e.ms)
			else {
				console.error(e)
				setTimeout(this.regen_mp.bind(this), 1000)
			}
		}
	}

	// SETUP
	init() {
		this.run()
		this.regen_mp()
		setInterval(function () {
			let to_query = get('t_query') || get('query')
			if (to_query != this.destination)
				this.destination = get('t_query') || get('query')
		}, 1000)
	}
}
class Ranger_Strategy extends Strategy {
	constructor() {
		super()
	}
	select_attack() {
		let targets = this.get_target()
			.filter(m => m.hp <= character.attack * G.skills['3shot'].damage_multiplier)

		if (targets.length >= 2) return '3shot'
		return 'attack'
	}

}

class Skill {
	constructor(skill_name) {
		this.skill_name = skill_name

	}
}
module = {
	exports: {
		Strategy, Ranger_Strategy
	}
}