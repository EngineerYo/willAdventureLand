const { priest_loop, give_merchant_loop, draw_loop, form_party } = require_code('21_Loops')
const { afk_spots } = require_code('98_Constants')

load_code(96)

give_merchant_loop()
form_party()

priest_loop()

setInterval(() => {
	if (character.rip && !parent.S.dragold.live) respawn()
}, 250)