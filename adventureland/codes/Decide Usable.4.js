if (!is_on_cooldown('regen_hp')) {
	let {mp, max_mp, hp, max_hp} = parent.character
	
	// Initialize weights
	let [weight_hp, weight_mp] = [1, 1]

	if (parent.character.targets == 0) weight_hp *= 0.5
	let has_priest = false
	let party = get_party()
	for (let [name, obj] of Object.entries(party)) {
		if (obj.type == 'priest') has_priest = true	
	}
	if (has_priest) weight_hp *= 0.5

	/* cos pops up here because if f(x) = cos(x), f(0) = 1 and f(pi/2)=0
	We'll use this to our advantage; scale the hp and mp pools 
	such that 0 hp = f(0) and full hp = f(pi/2)
	*/
	let hp_scale = (hp / max_hp) * Math.PI/2
	let hp_weight = Math.cos(hp_scale) * weight_mp

	let mp_scale = (hp / max_hp) * Math.PI/2
	let mp_weight = Math.cos(hp_scale) * weight_hp

	if (hp < max_hp && hp_weight < mp_weight) use_skill('regen_hp')
	else if (mp < max_mp && mp_weight < hp_weight) use_skill('regen_mp')
}