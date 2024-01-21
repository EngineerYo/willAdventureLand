async function attack() {
	const target = get_targeted_monster()
	if (!target) target = get_nearest_monster({type:'dragold'})
	
	if (character.hp < character.max_hp) {
		heal(character)
	}
	else {
		if (target && can_attack(target)) await attack(target)
	}
}
setInterval(attack, character.frequency)