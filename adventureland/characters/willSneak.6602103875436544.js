const { Strategy } = require_code(30)
let strategy = new Strategy()

strategy.init()

const { give_merchant_loop, form_party } = require_code('21_Loops')
// const { afk_spots } = require_code('98_Constants')

load_code(96)
load_code(97)

give_merchant_loop()
form_party()

// mage_loop()


setInterval(() => {
    if (character.rip && !parent.S.dragold.live) {
        respawn()
        strategy.set_state('travel')
    }
}, 250)

