const { ranger_loop, give_merchant_loop, draw_loop, form_party } = require_code('21_Loops')
const { afk_spots } = require_code('98_Constants')

load_code(96)
load_code(97)

form_party()
give_merchant_loop()

ranger_loop()
<<<<<<< Updated upstream
//draw_loop()
=======
draw_loop()

setInterval(() => {
	if (character.rip && !parent.S.dragold.live) respawn()
}, 250)
>>>>>>> Stashed changes
