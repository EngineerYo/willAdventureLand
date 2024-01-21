Object.filter = (obj, predicate) => 
    Object.keys(obj)
		.filter( key => predicate(obj[key]) )
		.reduce( (res, key) => (res[key] = obj[key], res), {} )

class Strategy {
	constructor(name, scope) {
		this.name = name
		this.scope = scope
	}
	
	save() {
		set(this.scope)
	}
	load() {
		get(this.scope)
	}
}

class Priest_Strategy extends Strategy {
	constructor() {
		super()
	}
	run(scope) {
		// This priest is going to be a tank
		let party = get_party()
		let party_names = Object.keys(party)

		/*
		let monsters = Object.filter(parent.entities, s => s.type == 'monster' && !s.target && s.target != character.name)
		let targetted = []
		for (let monster_idx in monsters) {
			let monster = monsters[monster_idx]
			
			if (party_names.includes(monster.target) && !targetted.includes(monster.target)) {
				targetted.push(monster.target)
			}
		}
		*/
		let needs_healing = []
//		let needs_taunting = targetted
		
		for (let [member, _] of Object.entries(party)) {
			let player_obj = get_player(member)
			
			if (player_obj.hp < player_obj.max_hp) needs_healing.push(member)
			
			//if (player_obj.targets > 1 && character.name != member) needs_taunting.push(member)
		}
		
		// Taunt first, heal second
/*		if (needs_taunting.length > 0 && character.level >= 55) {
			use_skill('absorb', needs_taunting[0])
			return
		}
*/		
		// We'll eventually debuff the target here
		if (needs_healing.length == 0) return
		
		
		// If we only need to heal one target, use_skill('attack') them
		if (needs_healing.length == 1 && needs_healing[0] != character.name && character.mp < G.skills['partyheal'].mp) {
			use_skill('attack', needs_healing[0])
			return
		}
		else {
			if (G.skills['partyheal'].mp > character.mp) return
			if (is_on_cooldown['partyheal']) return
			use_skill('partyheal')
			return
		}
	}
}