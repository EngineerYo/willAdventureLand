var { merchant_name, keep_in_inventory, gold_to_keep, afk_spots } = require_code('98_Constants')
const { upgrade_whitelist, combine_whitelist, upgrade_loc, compound_loc, exchange_loc, exchange_whitelist } = require_code('98_Constants')

const { sell_whitelist } = require_code('98_Constants')

const { ms_to_next_skill, get_scroll } = require_code('2_UTILS')
const { draw_target, draw_range_and_motion } = require_code('99_DrawDebug')

async function draw_loop() {
	try {
		clear_drawings()

		draw_range_and_motion()
		draw_target(character, get_targeted_monster())
	}
	catch (e) {
		console.error(e)
	}

	setTimeout(draw_loop, (1 / 60) * 1000)
}

async function give_merchant_loop() {
	try {
		// Firstly, is our Merchant even nearby?
		if (get_player(merchant_name)) {

			for (let [idx, item] of character.items.entries()) {
				if (!item) continue
				// Dont give the item if it's supposed to be kept
				if (keep_in_inventory.includes(item.name)) continue

				// Dont give the item if it's levelled
				if (item.level !== undefined && item.level > 0) continue

				send_item(merchant_name, idx, item.q)
			}

			if (character.gold > gold_to_keep * 1.1) send_gold(merchant_name, character.gold - gold_to_keep)

		}
	}
	catch (e) {
		console.error(e)
	}

	setTimeout(give_merchant_loop, Math.max(250), ...arguments)
}


async function merchant_loop() {
	try {
		const my_characters = get_characters().map(s => s.name)
		const entities = Object.assign({}, parent.entities, { [character.name]: parent.character })

		if (!is_on_cooldown('regen_mp') && character.mp < character.max_mp) use_skill('regen_mp')
		for (let [id, char] of Object.entries(entities)) {
			if (char.type != 'character') continue
			let checks = [
				my_characters.includes(char.name) && (!char.s['mluck'] || !char.s['mluck'].strong || char.s['mluck'].ms < G.skills['mluck'].duration / 2),
				!my_characters.includes(char.name) && (char.s['mluck'] && char.s['mluck'].f == character.name && char.s['mluck'].ms < G.skills['mluck'].duration * 0.98),
				!my_characters.includes(char.name) && (char.s['mluck'] && char.s['mluck'].f != character.name && !char.s['mluck'].strong && char.s['mluck'].ms < G.skills['mluck'] * 0.98),
				!my_characters.includes(char.name) && !char.s['mluck']
			]
			if (checks.some(condition => condition)) {
				use_skill('mluck', char.name)
				break
			}
		}
	}
	catch (e) {
		console.error(e)
	}

	setTimeout(merchant_loop, Math.max(250, ms_to_next_skill('mluck')), ...arguments)
}
async function form_party() {
	try {
		const party_lead = merchant_name
		const in_party = Object.keys(get_party())
		if (get('t_query') == 'dragold') {
			setTimeout(form_party, 2500, ...arguments)
			return
		}

		switch (character.name) {
			case (party_lead):
				// Is the party already full?
				if (Object.keys(get_party()).length == 4) break

				// If not, start sending invites
				get_characters().map(other => other.name)
					.filter(other => other != character.name && (!in_party || !in_party.includes(other)))
					.forEach(other => send_party_invite(other))
				break
			default:
				if (in_party && in_party.includes(party_lead) || get('t_query') == 'dragold') break
				accept_party_invite(party_lead)
		}
	}
	catch (e) {
		console.error(e)
	}

	setTimeout(form_party, 500, ...arguments)
}

async function upgrade_loop() {

	// Can we even upgrade rn?
	if ([
		character.q.upgrade,
		character.map != upgrade_loc.map,
		distance(upgrade_loc, character) > 500
	].some(s => s == true)) {
		setTimeout(upgrade_loop, 1000, ...arguments)
		return
	}
	// Loop through entire inventory. Compare items to whitelist, upgrade with lowest compatable scroll
	let available_scrolls = ['scroll0']//, 'scroll1']
	let item_upgrade = character.items
		.reduce((acc, cur) => {
			if (cur === null || cur.level === undefined || G.items[cur.name].upgrade === undefined) return acc
			if (cur.level < acc.level && upgrade_whitelist.includes(cur.name) && available_scrolls.includes(get_scroll(cur))) return cur
			else return acc
		},
			{ level: 100 }
		)
	let idx_upgrade = character.items
		.findIndex((val, idx) => val != null && val.name == item_upgrade.name && val.level == item_upgrade.level)
	if (idx_upgrade === -1) {
		setTimeout(upgrade_loop, 1000, ...arguments)
		return
	}
	let req_scroll = get_scroll(character.items[idx_upgrade])
	if (locate_item(req_scroll) === -1) buy(req_scroll)

	use_skill('massproduction')
	set_message(`${item_upgrade.name}`)
	upgrade(idx_upgrade, locate_item(req_scroll)).then((data) => {
		upgrade_loop()
	})
}
async function combine_loop() {

	// Can we even combine rn?
	if ([
		character.q.compound,
		character.map != compound_loc.map,
		distance(compound_loc, character) > 500
	].some(s => s == true)) {
		setTimeout(combine_loop, 1000, ...arguments)
		return
	}

	// Loop through the entire inventory. For items that are compoundable, increment dictionary index
	let combos = {}
	let items = character.items
		.forEach((val, idx) => {
			if (val !== null && G.items[val.name]['compound'] !== undefined && combine_whitelist.includes(val.name)) {
				const u_id = `${val.name}_${val.level}`
				if (!combos[u_id]) combos[u_id] = []
				combos[u_id].push(idx)
			}
		})

	// We'll find the first array with length greater than 3
	const to_upgrade = Object.values(combos)
		.find(s => s.length >= 3)
	if (!to_upgrade) {
		setTimeout(combine_loop, 2000, ...arguments)
		return
	}

	let req_scroll = get_scroll(character.items[to_upgrade[0]])
	let idx_to_upgrade = to_upgrade.slice(0, 3)

	if (locate_item(req_scroll) == -1) buy(req_scroll)
	use_skill('massproduction')

	compound(...idx_to_upgrade, locate_item(req_scroll)).then((data) => {
		combine_loop()
	})
}
async function exchange_loop() {
	try {
		if ([
			character.q.exchange,
			character.map != exchange_loc.map,
			distance(exchange_loc, character) > 300
		].some(s => s == true)) {
			setTimeout(exchange_loop, 1000, ...arguments)
			return
		}

		let exchangeable = character.items
			.findIndex((val, idx) => val != null && exchange_whitelist.includes(val.name))

		if (exchangeable == -1) {
			setTimeout(exchange_loop, 1000, ...arguments)
			return
		}

		exchange(exchangeable).then((data) => {
			exchange_loop()
		})

	}
	catch (e) {
		console.error(e)
	}
}
async function sell_loop() {
	try {
		if ([
			character.map != exchange_loc.map,
			distance(exchange_loc, parent.character) > 500
		].some(s => s == true)) {
			setTimeout(sell_loop, 1000, ...arguments)
			return
		}

		let to_sell = character.items.findIndex((val, key) => sell_whitelist.includes(val?.name))
		if (to_sell == -1) {
			setTimeout(sell_loop, 1000, ...arguments)
			return
		}

		sell(to_sell)
		setTimeout(sell_loop, 1000, ...arguments)

	}
	catch (e) {
		console.error(e)
	}
}

async function do_consume() {
	if (is_on_cooldown('regen_mp')) return false
	if (character.mp < character.max_mp * 0.5) use_skill('use_mp')
	else use_skill('regen_mp')

	var items_entries = Object.entries(character.items)
	var elixir = items_entries.find(([idx, val]) => val.name == 'elixirvit0')
	var has_elixir = character.slots?.elixir?.name == 'elixirvit0'
	if (elixir && !has_elixir) consume(elixir[0])

	return true
}

async function do_attack() {
	const query = get('t_query') || get('query')
	const spot = afk_spots[query][character.name]
	const priority = afk_spots[query].priority

	const dragold_priest = 'earthPri'
	if (query == 'dragold' && !Object.keys(get_party()).includes(dragold_priest) && parent.S.dragold.live) {
		leave_party()
		send_party_request(dragold_priest)
	}

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
						let prio_a = priority.findIndex(s => s == a['mtype'])
						let prio_b = priority.findIndex(s => s == b['mtype'])

						if (prio_a == prio_b) return 0
						else if (prio_a < prio_b) return -1
						else if (prio_a > prio_b) return 1
					})
					.shift()
				change_target(target)
			}
		}
		if (get('t_query') == 'dragold') {
			let player_count = Object.entries(parent.entities).filter(([id, char]) => char.type == 'character').length
			let in_party = Object.keys(get_party()).length > 0
			if (target && can_attack(target) && in_party && player_count > 5) {
				await attack(target)
			}
		}
		else if (get('t_query') == null) {
			if (target && can_attack(target)) await attack(target)
		}

		return target
	}
	catch (e) {
		console.error(e)
	}

}
async function do_heal_attack() {
	const query = get('t_query') || get('query')
	const spot = afk_spots[query][character.name]
	const priority = afk_spots[query].priority

	const dragold_priest = 'earthPri'
	if (query == 'dragold' && !Object.keys(get_party()).includes(dragold_priest) && parent.S.dragold.live) {
		leave_party()
		send_party_request(dragold_priest)
	}

	loot()

	try {
		if (smart.moving || (smart.searching && !smart.found)) return
		if (distance(character, spot) > 10 && !can_move_to(spot.x, spot.y)) {
			smart_move({ x: spot.x, y: spot.y, map: spot.map })
		}
		else if (distance(character, spot) > 10 && can_move_to(spot.x, spot.y)) {
			if (smart.moving) use_skill('stop')
			move(spot.x, spot.y)
		}

		const heal_target = Object.keys(get_party())
			.map(member => get_player(member))
			.filter(member => member && member.max_hp - member.hp >= character.heal)
			.filter(member => distance(member, character) < character.range)
			.sort(member => member.hp)
			.shift()

		if (heal_target) {
			use_skill('heal', heal_target)
			return heal_target
		}
		if (get('t_query') == 'dragold') {
			let player_count = Object.entries(parent.entities).filter(([id, char]) => char.type == 'character').length
			let in_party = Object.keys(get_party()).length > 0
			if (target && can_attack(target) && in_party && player_count > 5) {
				await attack(target)
			}
		}
		else if (get('t_query') == null) {
			if (target && can_attack(target)) await attack(target)
		}
	}
	catch (e) {
		console.error(e)
	}

}

async function ranger_loop() {
	const query = get('query')

	loot()

	const ranger_regen_loop = () => {
		do_consume()
		setTimeout(ranger_regen_loop, Math.max(250, ms_to_next_skill('regen_mp')))
	}
	const ranger_attack_loop = () => {
		do_attack()

		setTimeout(ranger_attack_loop, Math.max(250, ms_to_next_skill('attack')))
	}
	const ranger_skill_loop = () => {
		do_ranger_skill()
		setTimeout(ranger_skill_loop, 250)
	}

	ranger_regen_loop()
	ranger_attack_loop()
	ranger_skill_loop()

	character.all((name, data) => {
		report()
	})

}
async function mage_loop() {
	const query = get('query')

	loot()

	const mage_regen_loop = () => {
		do_consume()
		setTimeout(mage_regen_loop, Math.max(250, ms_to_next_skill('regen_mp')))
	}
	const mage_attack_loop = () => {
		do_attack()

		setTimeout(mage_attack_loop, Math.max(250, ms_to_next_skill('attack')))
	}
	const mage_skill_loop = () => {
		do_mage_skill()
		setTimeout(mage_skill_loop, 250)
	}

	mage_regen_loop()
	mage_attack_loop()
	mage_skill_loop()
}
async function priest_loop() {
	const query = get('query')

	const priest_regen_loop = () => {
		do_consume()
		setTimeout(priest_regen_loop, Math.max(250, ms_to_next_skill('regen_mp')))
	}
	const priest_attack_loop = () => {
		do_heal_attack()

		setTimeout(priest_attack_loop, Math.max(ms_to_next_skill('attack'), 250))
	}
	const priest_skill_loop = () => {
		do_priest_skill()
		setTimeout(priest_skill_loop, 250)
	}

	priest_regen_loop()
	priest_attack_loop()
	priest_skill_loop()
}

async function do_ranger_skill() {
	const target = get_targeted_monster()
	if (!target) return

	// Should we use Hunter's Mark?
	let hunters_mark_conditions = [
		// Only cast if the target isn't already affected
		!target.s['huntersmark'],
		// Only cast if we're off CD
		!is_on_cooldown('huntersmark'),
		// Only cast if the damage we'd deal in hunter's mark's duration less than the target hp?
		target.hp > (G.skills['huntersmark'].duration / (character.frequency * 1000)) * character.attack,
		// Will we have enough mana to attack still?
		character.mp > G.skills['huntersmark'].mp + character.mp_cost * ((G.skills['use_mp'].cooldown * G.skills['regen_mp'].cooldown_multiplier) / (character.frequency * 1000))
	]
	if (hunters_mark_conditions.every(s => s == true)) use_skill('huntersmark')

	// Should we use Triple Shot?
	let nearby_queries = Object.values(parent.entities)
		.filter(m => m.type == 'monster' && m.mtype == get('query'))
		.filter(m => distance(m, character) < character.range + character.xrange)
		.filter(m => m.hp * 0.6 < character.attack * G.skills['3shot'].damage_multiplier)
	// .sort((a, b) => {
	// 	if (distance(a, character) < distance(b, character)) return -1
	// 	else if (distance(a, character) > distance(b, character)) return 1
	// 	else return 0
	// })
	let threeshot_conditions = [
		// Are there enough targets nearby?
		nearby_queries.length >= 3,
		// Can we afford the mana cost?
		character.mp > G.skills['3shot'].mp * ((G.skills['use_mp'].cooldown * G.skills['regen_mp'].cooldown_multiplier) / (character.frequency * 1000)),
		// Is the ability off CD?
		!is_on_cooldown('3shot'),
	]
	if (threeshot_conditions.every(s => s == true)) use_skill('3shot', nearby_queries)

}
async function do_mage_skill() {
	// Should we use Energize?
	var energize_target = Object.entries(get_party())
		.filter(([name, obj]) => get_player(name) && !get_player(name).s['energize'] && obj.type != 'merchant' && distance(get_player(name), character) < G.skills['energize'].range)
		.sort(([name, obj]) => get_player(name).mp / get_player(name).max_mp)
		.map(([name, obj]) => name)
		.shift()

	const energize_conditions = [
		// Only cast if we have someone to use energize on
		energize_target != null,
		// Only cast if we're off CD
		!is_on_cooldown('energize'),
	]
	if (energize_conditions.every(s => s == true)) {
		log(`Energizing ${energize_target}`)
		const mana_to_spare = character.mp - (character.max_mp / 2)
		if (mana_to_spare < 0) mana_to_spare = 1
		const energize_amount = Math.min(energize_target.max_mp - energize_target.mp, mana_to_spare)
		use_skill('energize', energize_target, energize_amount)
	}
}
async function do_priest_skill() {
	if (character.rip) return
	// Should we use partyheal?
	const partyheal_output = G.skills['partyheal'].levels.reduce((acc, cur) => cur[0] < character.level ? cur : acc, 500)
	const partyheal_targets = Object.entries(get_party())
		.filter(([name, obj]) => get_player(name))
		.filter(([name, obj]) => get_player(name).max_hp - get_player(name).hp >= partyheal_output)

	const partyheal_no_range = partyheal_targets
		.filter(([name, obj]) => distance(obj, character) > character.range)

	const partyheal_conditions = [
		// Is there more than one target, OR anyone outside of range?
		partyheal_targets.length > 1 || partyheal_no_range.length,
		// Is partyheal off CD?
		!is_on_cooldown('partyheal'),
		// Can we afford to partyheal?
		character.mp > G.skills['partyheal'].mp,
		// Will we be able to do a normal heal afterwards?
		character.mp - G.skills['partyheal'].mp > character.mp_cost
	]
	if (partyheal_conditions.every(s => s == true)) use_skill('partyheal')


	// Should we use Absorb Sins?
	const party_members = Object.keys(get_party())
	const member_idps = {}
	Object.values(parent.entities)
		.filter(m => m.type == 'monster')
		.filter(m => party_members.includes(m.target) && m.target != character.name)
		.forEach(m => {
			if (!member_idps[m.target]) member_idps[m.target] = 0
			member_idps[m.target] += m.attack * m.frequency
		})

	const [absorb_target, idps] = Object.entries(member_idps).reduce((acc, cur) => cur[1] > acc[1] ? cur : acc, [null, 0])

	const absorb_conditions = [
		// Is our level high enough?
		character.level >= G.skills['absorb'].level,
		// Does anyone else even have aggro?
		absorb_target,
		// Is absorb off CD?
		!is_on_cooldown('absorb'),
		// Can we afford the mana cost?
		character.mp > G.skills['absorb'].mp,
		// Can we still heal afterwards?
		character.mp - G.skills['absorb'].mp > character.mp_cost,
		// Is the target worth absorbing? incoming friendly dps > 50% hps
		idps > character.heal * character.frequency * 0.5,

	]
	if (absorb_conditions.every(s => s == true)) {
		use_skill('absorb', absorb_target)
		log(`Absorbing ${absorb_target}`)
	}


	// Should we use Curse?
	const curse_target = get_targeted_monster()
	const curse_conditions = [
		// Is curse off CD?
		!is_on_cooldown('curse'),
		// Do we have something to curse?
		curse_target != null,
		// Can we afford the mana cost?
		character.mp > G.skills['curse'].mp,
		// Can we still heal afterwards?
		character.mp - G.skills['absorb'].mp > character.mp_cost,
		// Is the target worth cursing? their dps > 75% of my hps
		curse_target && curse_target.attack * curse_target.frequency > character.heal * character.frequency * 0.75,
		// Is the target within range of it's target?
		curse_target && distance(curse_target, character) < curse_target.range * 1.5,

	]
	if (curse_conditions.every(s => s == true)) {
		log(`Cursing`)
		use_skill('curse', curse_target)
	}

}

/*
report gets called on all character events.
*/
function report() {
	var set_obj = {}

	set_obj['name'] = character.name
	set_obj['x'] = character.x
	set_obj['y'] = character.y
	set_obj['map'] = character.map

	set_obj['hp'] = character.hp
	set_obj['mp'] = character.mp
	set_obj['max_hp'] = character.max_hp
	set_obj['max_mp'] = character.max_mp

	let mpot_idx = locate_item('mpot1')
	let hpot_idx = locate_item('hpot1')
	set_obj['mpot1'] = mpot_idx !== -1 ? character.items[mpot_idx].q : 0
	set_obj['hpot1'] = hpot_idx !== -1 ? character.items[hpot_idx].q : 0

	set_obj['inventory'] = character.items.filter(s => s !== null).map(s => s.name)
	set_obj['empty_slots'] = character.esize
	set_obj['gold'] = character.gold

	set_obj['slots'] = character.slots

	set_obj['attack'] = character.attack
	set_obj['heal'] = character.heal
	set_obj['frequency'] = character.frequency
	set_obj['speed'] = character.speed

	set_obj['rip'] = character.rip
	set_obj['target'] = character.target

	set_obj['cc'] = character.cc

	set(character.name, set_obj)
}

module = {
	exports: {
		give_merchant_loop,
		draw_loop,
		merchant_loop,
		form_party,
		combine_loop,
		upgrade_loop,
		exchange_loop,
		sell_loop,
		ranger_loop,
		mage_loop,
		priest_loop,
	},
}