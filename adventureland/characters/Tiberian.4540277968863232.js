const { ranger_loop, give_merchant_loop, draw_loop, form_party } = require_code('21_Loops')
const { afk_spots } = require_code('98_Constants')

load_code(96)

form_party()
give_merchant_loop()

ranger_loop()
draw_loop()
