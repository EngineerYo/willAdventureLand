const UTILS = require_code('UTILS')
var { Interface, Strategies, Directives } = require_code('Strategies')
require_code(99)

var this_party = new Interface()
this_party.directive = 'goo'
this_party.run()


async function attack_loop(spot, query) {
    try {
        if (get_map().name !== spot.map.name || !can_move_to(spot.x, spot.y)) {
            if (!smart.moving) smart_move(spot.map_key)
        }
        else {
            if (smart.moving) use_skill('stop')
            if (distance(character, spot) > 0) move(spot.x, spot.y)
            if (!is_on_cooldown('regen_mp')) use_skill('regen_mp')
            loot()

            var target = get_targeted_monster()
            if (!target || !is_in_range(target, 'attack')) {
                for (let mtype of afk_spots[query].priority) {
                    let found = get_nearest_monster({ type: mtype })
                    if (!found || distance(found, character) > character.range) continue

                    change_target(found)
                    break
                }
            }

            if (target && can_attack(target)) await attack(target)

        }
    }
    catch (e) {
        console.error(e)
    }

    setTimeout(attack_loop, Math.max(250, ms_to_next_skill('attack')), ...arguments)
}

async function heal_loop(spot, query) {
    try {
        if (get_map().name !== spot.map.name) {
            if (!smart.moving) smart_move(spot.map_key)
        }
        else {
            if (smart.moving) use_skill('stop')
            if (distance(character, spot) > 0) move(spot.x, spot.y)
            if (!is_on_cooldown('regen_mp')) use_skill('regen_mp')
            loot()

            let party = Object.entries(get_party()).map(([name, obj], idx) => get_player(name)).filter(s => s != null)
            let to_heal = party.filter((member) => member.max_hp - member.hp >= character.heal).sort((member) => member.hp)
            // TODO: Calculate actual output based on level
            let to_partyheal = party.filter((member) => member.max_hp - member.hp >= G.skills.partyheal.output * 2)
            let can_mp_partyheal = character.mp > G.skills.partyheal.mp

            // Save at least 3 heals in the bank, or two partyheals
            let attack_threshold = Math.max(character.mp_cost * 3, G.skills.partyheal.mp * 4)

            if (can_mp_partyheal && to_partyheal.length > 1) use_skill('partyheal')
            else if (to_heal.length > 0) use_skill('heal', to_heal[0].name)
            else if (character.mp > attack_threshold) {
                var target = get_targeted_monster()
                if (!target || !is_in_range(target, 'attack')) {
                    for (let mtype of afk_spots[query].priority) {
                        let found = get_nearest_monster({ type: mtype })
                        if (!found || distance(found, character) > character.range) continue

                        target = found
                        break
                    }
                }

                if (target && can_attack(target)) await attack(target)
            }
        }
    }
    catch (e) {
        console.error(e)
    }
    setTimeout(heal_loop, Math.max(250, ms_to_next_skill('heal'), ms_to_next_skill('attack')), ...arguments)
}