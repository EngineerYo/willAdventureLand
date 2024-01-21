const { mage_loop, give_merchant_loop, form_party } = require_code('21_Loops')
const { afk_spots } = require_code('98_Constants')

load_code(96)

give_merchant_loop()
form_party()

mage_loop()