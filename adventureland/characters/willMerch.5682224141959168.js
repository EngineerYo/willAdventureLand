const { merchant_loop, form_party, combine_loop, upgrade_loop, exchange_loop, sell_loop, report } = require_code('21_Loops')

load_code(96)

setInterval(() => {
	if (parent.S.dragold.live) {
		if (!get('t_query')) set('t_query', 'dragold')
	}
	else if (!parent.S.dragold.live) {
		if (get('t_query') === 'dragold') set('t_query', null)
	}
}, 100)
form_party()

merchant_loop()

upgrade_loop()
combine_loop()
exchange_loop()
sell_loop()

character.all((name, data) => {
	report()
})

const { draw_monster_ranges } = require_code(99)
//const { monster_lookup } = require_code(98)
//draw_monster_ranges(monster_lookup())



setInterval(() => {
	if (character.rip && !parent.S.dragold.live) respawn()
}, 250)