const { Priest_Strategy } = require_code(30)
let strategy = new Priest_Strategy()
strategy.init()

const { give_merchant_loop, draw_loop, form_party } = require_code('21_Loops')

load_code(96)
load_code(97)

give_merchant_loop()
form_party()

setInterval(() => {
	if (character.rip && !parent.S.dragold.live) {
		respawn()
		strategy.set_state('travel')
	}
}, 250)