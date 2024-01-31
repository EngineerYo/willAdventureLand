const { GLOBAL_PRIORITY, get_center } = require_code(98)
const { ms_to_next_skill: ms_skill, in_boundary } = require_code(2)

class Strategy {
	constructor() {
		this.targets = []
		this.intervals = {}

		// this.query = get('t_query') || get('query')
		this.query = get('query')
		this.farm_area = null

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
			if (interval_idx == 'mp') continue
			clearTimeout(this.intervals[interval_idx])
		}

		this.start_loops()

		this.state = to
		this.run()
		return to
	}

	async travel() {
		this.farm_area = this.find_target()
		if (this.at_destination(this.farm_area.boundary)) {
			this.set_state('attack')
		}
		else {
			log('Moving!')
			let party_keys = Object.entries(get_party())
				.filter(([k, v]) => v.type != 'merchant')
				.map(([k, v]) => k)
				.sort() // sort via alphabet

			// Offset us from the center point
			let my_idx = party_keys.findIndex(s => s == character.name)
			let r = 20
			let offset = { x: r * Math.cos((2 * Math.PI) / (my_idx + 1)), y: r * Math.sin((2 * Math.PI) / (my_idx + 1)) }
			let center = get_center(this.farm_area)

			let move_to = { x: center.x + offset.x, y: center.y + offset.y, map: this.farm_area.map }
			console.log(move_to)
			let move_res = await smart_move(move_to)
			if (move_res?.success) this.set_state('attack')
		}
	}
	async attack() {
		this.loot()
		try {
			this.targets = this.get_target()
			this.attack_skill = this.select_attack()

			await use_skill(this.attack_skill, ...this.targets)
			this.intervals['attack'] = setTimeout(this.run.bind(this), 1000 / character.frequency)
		}
		catch (e) {
			let ms_to = 1000
			if (e?.response == 'cooldown') ms_to = e.ms

			this.intervals['attack'] = setTimeout(this.run.bind(this), ms_to * 1.05)
			console.warn(e)
		}
	}

	async run() {
		try {
			this[this.state]()
		}
		catch (e) {
			console.warn(e)
		}
	}

	/**
	 * @param mtype Target mtype to find. Returns highest scoring area
	 * @returns Monster boundary object
	 */
	find_target(mtype = this.query) {
		let farm_areas = get('MONSTERS')
		if (!farm_areas[mtype]) return false

		let mtype_areas = farm_areas[mtype]

		let to_farm = mtype_areas
			.reduce((acc, cur) => {
				if (acc.score < cur.score) return cur
				return acc
			})

		this.farm_area = to_farm
		return to_farm
	}
	/**
	 * @param destination A boundary object returned from monster_lookup
	 * @returns Boolean, depending if we're at the target or not
	 */
	at_destination(destination = this.farm_area) {
		if (destination.map != character.map) return false
		if (in_boundary(character, destination, character.range / 2)) return true
		return false
	} 3


	// DO-ER FUNCTIONS
	get_target() {
		let priority_list = [...GLOBAL_PRIORITY, this.query]
		let party_members = Object.keys(get_party())


		let monsters = Object.values(parent.entities)
			.filter(m => m.type == 'monster')
			.filter(m => is_in_range(m, 'attack'))

		monsters.forEach(m => {
			if (m.target && party_members.includes(m.target)) m['high'] = true
		})

		monsters.sort((a, b) => {
			if (a.high && !b.high) return 1
			if (!a.high && b.high) return -1

			let [pa, pb] = [priority_list.findIndex(m => a.mtype == m), priority_list.findIndex(m => b.mtype == m)]
			if (pa < 0) pa = 100
			if (pb < 0) pb = 100

			// First, sort by mtype
			if (pa < pb) return 1
			if (pb < pa) return -1

			// then, sort by distance
			if (distance(a, character) < distance(b, character)) return 1
			if (distance(a, character) > distance(b, character)) return -1
		})

		return monsters

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

			if (party_targets.length) {
				return party_targets
			}
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
	async regen_mp() {
		try {
			// Should we use a potion?
			if (character.mp + 400 < character.max_mp && locate_item('mpot1') !== -1) {
				let duration = G.skills['use_mp'].cooldown * 1.05
				await use_skill('use_mp')
				this.intervals['mp'] = setTimeout(this.regen_mp.bind(this), duration)
			}
			else {
				let duration = 250
				this.intervals['mp'] = setTimeout(this.regen_mp.bind(this), duration)
			}
		}
		catch (e) {
			if (e?.response == 'cooldown') {
				let duration = e.ms
				this.intervals['mp'] = setTimeout(this.regen_mp.bind(this), duration)
			}
			else {
				let duration = 250
				this.intervals['mp'] = setTimeout(this.regen_mp.bind(this), duration)
			}
		}
	}
	loop_skill(skill_name) {
		if (!G.skills[skill_name]) {
			console.warn(`${skill_name} does not exist`)
			return false
		}
		if (!this[`skill_${skill_name}`]) {
			console.warn(`${skill_name} not loaded into controller`)
			return false
		}

		this[`skill_${skill_name}`]()
	}
	start_loops() {
		return true
	}
	loot() {
		let chests = get_chests()
		for (let [id, val] of Object.entries(chests)) {
			loot(id)
		}
		return chests.length
	}
	// SETUP
	init() {
		this.run()
		this.regen_mp()

		let self = this
		setInterval(function () {
			let to_query = get('query')
			if (to_query != self.query) {
				self.query = to_query
				self.set_state('travel')
			}
		}, 1000)
	}
}
class Ranger_Strategy extends Strategy {
	constructor() {
		super()
	}
	select_attack() {
		let targets = this.targets
		if (targets[0]?.high) return 'attack'

		let three_oneshots = 0
		for (let i = 0; i < 2; i += 1) {
			if (targets[i].hp < character.attack * G.skills['3shot'].damage_multiplier) three_oneshots += 1
		}

		if (three_oneshots >= 2) return '3shot'
		return 'attack'
	}

	start_loops() {
		this.loop_skill('huntersmark')
		this.loop_skill('supershot')
	}
	async skill_huntersmark() {
		try {
			// Does the target already have huntersmark?
			if (this.targets[0].s['huntersmark']) {
				this.intervals['huntersmark'] = setTimeout(this.skill_huntersmark.bind(this), this.targets[0].s['huntersmark'].ms)
				return
			}
			// Do we even need huntersmark?
			if ((G.skills['huntersmark'].duration / (character.frequency * 1000)) * character.attack) {
				this.intervals['huntersmark'] = setTimeout(this.skill_huntersmark.bind(this), 250)
				return
			}
			// Can we even cast huntersmark?
			if (character.mp < G.skills['huntersmark'].mp) {
				this.intervals['huntersmark'] = setTimeout(this.skill_huntersmark.bind(this), 250)
				return
			}

			await use_skill('huntersmark', this.targets[0])
			this.intervals['huntersmark'] = setTimeout(this.skill_huntersmark.bind(this), G.skills['huntersmark'].cooldown)
		}
		catch (e) {
			console.warn(e)
			this.intervals['huntersmark'] = setTimeout(this.skill_huntersmark.bind(this), 500)
		}

	}
	async skill_supershot() {
		try {
			// Can we even cast supershot?
			if (character.mp < G.skills['supershot'].mp) {
				this.intervals['supershot'] = setTimeout(this.skill_supershot.bind(this), 250)
				return
			}

			if (is_on_cooldown('supershot')) {
				this.intervals['supershot'] = setTimeout(this.skill_supershot.bind(this), ms_skill('supershot'))
				return
			}

			await use_skill('supershot', this.get_target()[0])
			this.intervals['supershot'] = setTimeout(this.skill_supershot.bind(this), G.skills['supershot'].cooldown)
		}
		catch (e) {
			console.warn(e)
			this.intervals['supershot'] = setTimeout(this.skill_supershot.bind(this), 500)
		}

	}
}
class Priest_Strategy extends Strategy {
	select_attack() {
		let heal_targets = Object.keys(get_party())
			.map(member => get_player(member))
			.filter(member => member && member.max_hp - member.hp >= character.heal * 0.75)
			.filter(member => distance(member, character) < character.range)
			.sort(member => member.hp)

		if (!heal_targets.length) return 'attack'

		this.targets = heal_targets
		return 'heal'
	}
	start_loops() {
		this.loop_skill('partyheal')
	}
	async skill_partyheal() {
		try {
			// Do we have enough mana?
			if (character.mp < G.skills['partyheal'].mp) {
				this.intervals['partyheal'] = setTimeout(this.skill_partyheal.bind(this), 50)
				return
			}
			if (is_on_cooldown('partyheal')) {
				this.intervals['partyheal'] = setTimeout(this.skill_partyheal.bind(this), ms_skill('partyheal'))
				return
			}

			// move this calculation to static?
			const output = G.skills['partyheal'].levels
				.reduce((acc, cur) => {
					if (character.level >= cur[0]) return cur
					return acc
				}, [-1, 0])[1]

			let heal_targets = Object.keys(get_party())
				.map(member => get_player(member))
				.filter(member => member && member.max_hp - member.hp >= output * 0.75)

			if (heal_targets.length == 0) {
				this.intervals['partyheal'] = setTimeout(this.skill_partyheal.bind(this), 50)
				return
			}
			console.log(heal_targets)

			await use_skill('partyheal')
			this.intervals['partyheal'] = setTimeout(this.skill_partyheal.bind(this), G.skills['partyheal'].cooldown)
		}
		catch (e) {
			console.warn(e)
			this.intervals['partyheal'] = setTimeout(this.skill_partyheal.bind(this), 50)
		}
	}
}

class Mage_Strategy extends Strategy {
	start_loops() {
		this.loop_skill('energize')
	}
	async skill_energize() {
		try {
			// Do we have enough mana?
			if (character.mp < character.max_mp / 2) {
				this.intervals['energize'] = setTimeout(this.skill_energize.bind(this), 500)
				return
			}

			if (is_on_cooldown('energize')) {
				this.intervals['energize'] = setTimeout(this.skill_energize.bind(this), ms_skill('energize'))
				return
			}

			let energize_mana = character.mp - (character.max_mp / 2)

			let energize_target = Object.keys(get_party())
				.map(member => get_player(member))
				.filter(member => member && member.max_mp - member.mp > 0)
				.filter(member => distance(member, character) < G.skills['energize'].range)
				.sort(member => member.mp)

			if (energize_target.length == 0) {
				this.intervals['energize'] = setTimeout(this.skill_energize.bind(this), 500)
				return
			}

			await use_skill('energize', energize_target[0], energize_mana)
			this.intervals['energize'] = setTimeout(this.skill_energize.bind(this), G.skills['energize'].cooldown)
		}
		catch (e) {
			console.warn(e)
			this.intervals['energize'] = setTimeout(this.skill_energize.bind(this), 500)

		}
	}
}

module = {
	exports: {
		Strategy, Ranger_Strategy, Priest_Strategy, Mage_Strategy
	}
}