let states = ['Idle', 'Resting', 'Fighting', 'Traveling']
let state = 'Resting'
let tickrate = 4

const prey = 'goo'

setInterval(function(){	
	
	set_message(state)
	stateFunctions[state]()
	
	loot();
},1000/tickrate)

let state_data = {}

const changeState = (to) => {
	let fromState = state
	state = to
	game_log(`${fromState} -> ${state}`)
	state_data = {}
}

const stateFunctions = {
	'Idle': () => {
	},
	'Resting': () => {
		if (character.targets > 0) {
			changeState(states[2])
			return
		}
		
		if (character.hp < character.max_hp * 0.75) {
			if (is_on_cooldown('regen_hp')) return
			use_skill('regen_hp')
		}
		else if (character.mp < character.max_mp * 0.50) {
			if (is_on_cooldown('regen_mp')) return
			use_skill('regen_mp')
		}
		else {
			changeState(states[2])
		}
	},
	'Fighting': () => {
		
		// Check for low hp
		let needs_hp = character.hp < character.max_hp * 0.25
		let needs_mp = character.mp < character.max_mp * 0.5
		let inCombat = character.targets > 0
		if (!inCombat && (needs_hp || needs_mp)) {
			//changeState(states[1])
			//return
		}
		
		
		if (!is_on_cooldown('regen_mp')) use_skill('regen_mp')
	/*	
		// If critical mana, regen mana
		if (!is_on_cooldown('regen_mp') && character.mp < character.max_mp*0.1) use_skill('regen_mp')
		
		// If available, regen health
		if (!is_on_cooldown('regen_hp') && character.hp < character.max_hp) use_skill('regen_hp')
		
		// If available, regen mana
		if (!is_on_cooldown('regen_mp') && character.mp < character.max_mp) use_skill('regen_mp')
		
		// Decide to pick a new target
		if(character.rip) return;
*/

		var target = get_targeted_monster();
		if (!target) {
			target = get_nearest_monster({min_xp:100,type:prey})
			if (target) change_target(target)
			else {
				return
			}
		}
		
		// change to move in circle around enemy range+speed?
		// Move to max range
		let max_range = parent.character.range
		let range = distance(parent.character, target)
		let reach = target.range + target.speed/tickrate
		
		let directionX = (character.x - target.x)/range
		let directionY = (character.y - target.y)/range
		
		let relativePositionX = directionX * reach*2
		let relativePositionY = directionY * reach*2
		
		let [max_pos_x, max_pos_y] = [directionX * range, directionY * range]
		
		let absPositionX = target.x + relativePositionX
		let absPositionY = target.y + relativePositionY
		
		if (!is_in_range(target, 'attack')) {
			if (character.moving) return
			xmove(max_pos_x, max_pos_y)
			//changeState({destination: [absPositionX, absPositionY], previous: states[3]})
		}
		else if (reach*1.5 > range && reach*1.5 < max_range) {
			move (absPositionX, absPositionY)
		}

		if (can_attack(target)) attack(target)
		// Should we Hunter's Mark the target?
		//if (target.hp > character.attack*5 && !is_on_cooldown('huntersmark')) use_skill('huntersmark')
	},
	'Traveling': (scope) => {
		let {destination, previous} = scope
		smart_move(destination[0], destination[1], changeState(previous))
	}
}