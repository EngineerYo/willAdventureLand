async function do_attack() {
	const spot = { map: 'main', x: 0, y: 775 }
	const priority = ['goo']

	loot()

	try {
		if (smart.moving || (smart.searching && !smart.found)) {
			return
		}
		if (distance(character, spot) > 10 && !can_move_to(spot.x, spot.y)) {
			smart_move({ x: spot.x, y: spot.y, map: spot.map })
		}
		else if (distance(character, spot) > 10 && can_move_to(spot.x, spot.y)) {
			if (smart.moving) use_skill('stop')
			move(spot.x, spot.y)
		}

		let target = get_targeted_monster()
		if (!target || !is_in_range(target, 'attack')) {
			// First, check if anyone else in the party has a targetconst party_members = Object.keys(get_party())
			const party_members = Object.keys(get_party())
			const party_targets = Object.values(parent.entities)
				.filter(m => m.type == 'monster')
				.filter(m => party_members.includes(m.target))
				.filter(m => m.hp > 500)
				.sort(m => distance(character, m))

			if (party_targets.length > 0) {
				target = party_targets.shift()
				change_target(target)
			}
			else {
				// If nobody else has a target, choose a new one
				const target = Object.values(parent.entities)
					.filter(m =>
						m.type == 'monster' &&
						priority.includes(m['mtype']) &&
						distance(character, m) < character.range
					)
					.sort((a, b) => {
						let prio_a = priority.findIndex(s => s == a['mtype']) // ERROR POINTS TO THIS LINE
						let prio_b = priority.findIndex(s => s == b['mtype'])

						if (prio_a == prio_b) return 0
						else if (prio_a < prio_b) return -1
						else if (prio_a > prio_b) return 1
					})
					.shift()
				change_target(target)
			}
		}
		if (target && can_attack(target)) await attack(target)
		return target
	}
	catch (e) {
		console.error(e)
	}
}

setInterval(do_attack, character.frequency)