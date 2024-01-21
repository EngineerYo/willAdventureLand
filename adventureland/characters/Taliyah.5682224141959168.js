const { merchant_loop, form_party, combine_loop, upgrade_loop, exchange_loop, sell_loop } = require_code('21_Loops')

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

// setInterval(() => {
// 	if (parent.S.dragold.live) set('t_query', 'dragold')
// 	else set('t_query', null)
// }, 2000)