var lastcc = 0;
init_ccmeter();
function init_ccmeter() {
    let $ = parent.$;
    let statbars = $('#bottommid');
    statbars.find('#ccmeter').remove();
    let ccmeter = $('<div id="ccmeter"></div>').css({
        fontSize: '15px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        width: "50%",
        margin: "0 auto"
    });
    let ccmeter_content = $('<div id="ccmetercontent"></div>')
        .html("<div><div id='ccmeterfill'></div></div>")
        .css({
            display: 'table-cell',
            verticalAlign: 'middle',
            background: 'green',
            border: 'solid gray',
            borderWidth: '4px 4px 0px, 4px',
            height: '15px',
            color: '#FFD700',
            textAlign: 'center',
            width: "100%",
        })
        .appendTo(ccmeter);
    statbars.children().first().after(ccmeter);
    update_ccmeter();
}
function update_ccmeter() {
    let $ = parent.$;
    var fillAmount = ((character.cc / 180) * 100).toFixed(0);
    $("#ccmeterfill").css({
        background: 'red',
        height: '15px',
        color: '#FFD700',
        textAlign: 'center',
        width: fillAmount + "%",
    });
}
//Clean out an pre-existing listeners
if (parent.prev_handlersccmeter) {
    for (let [event, handler] of parent.prev_handlersccmeter) {
        parent.socket.removeListener(event, handler);
    }
}
parent.prev_handlersccmeter = [];
//handler pattern shamelessly stolen from JourneyOver
function register_ccmeterhandler(event, handler) {
    parent.prev_handlersccmeter.push([event, handler]);
    parent.socket.on(event, handler);
};
function ccmeter_playerhandler(event) {
    if (event.cc != lastcc) {
        update_ccmeter();
        lastcc = event.cc;
    }
}
register_ccmeterhandler("player", ccmeter_playerhandler);

function add_bank_button() {
    let $ = parent.$;
    let trc = $("#toprightcorner");
    $('#bankbutton').remove();
    let bankButton = $('<div id="bankbutton" class="gamebutton" onclick="parent.$(`#maincode`)[0].contentWindow.render_bank_items()">BANK</div>');
    trc.children().first().after(bankButton);
}

add_bank_button();

function render_bank_items() {
    if (!character.bank) return game_log("Not inside the bank");

    function itm_cmp(a, b) {
        return (
            (a == null) - (b == null) ||
            (a && (a.name < b.name ? -1 : +(a.name > b.name))) ||
            (a && b.level - a.level)
        );
    }

    var a = [
        ["Helmets", []],
        ["Armors", []],
        ["Underarmors", []],
        ["Gloves", []],
        ["Shoes", []],
        ["Capes", []],
        ["Rings", []],
        ["Earrings", []],
        ["Amulets", []],
        ["Belts", []],
        ["Orbs", []],
        ["Weapons", []],
        ["Shields", []],
        ["Offhands", []],
        ["Elixirs", []],
        ["Potions", []],
        ["Scrolls", []],
        ["Crafting and Collecting", []],
        ["Exchangeables", []],
        ["Others", []],
    ];

    let slot_ids = [
        "helmet", "chest", "pants", "gloves", "shoes", "cape", "ring", "earring", "amulet", "belt",
        "orb", "weapon", "shield", "offhand", "elixir", "pot", "scroll", "material", "exchange", "",
    ];

    object_sort(G.items, "gold_value").forEach(function (b) {
        if (!b[1].ignore)
            for (var c = 0; c < a.length; c++)
                if (
                    !slot_ids[c] ||
                    b[1].type == slot_ids[c] ||
                    ("offhand" == slot_ids[c] &&
                        in_arr(b[1].type, ["source", "quiver", "misc_offhand"])) ||
                    ("scroll" == slot_ids[c] &&
                        in_arr(b[1].type, ["cscroll", "uscroll", "pscroll", "offering"])) ||
                    ("exchange" == slot_ids[c] && G.items[b[0]].e)
                ) {
                    const dest_type = b[1].id;
                    let type_in_bank = [];
                    for (let bank_pock in character.bank) {
                        const bank_pack = character.bank[bank_pock];
                        for (let bonk_item in bank_pack) {
                            const bank_item = bank_pack[bonk_item];
                            if (bank_item && bank_item.name == dest_type)
                                type_in_bank.push(bank_item);
                        }
                    }
                    type_in_bank.sort(itm_cmp);
                    for (let io = type_in_bank.length - 1; io >= 1; io--) {
                        if (itm_cmp(type_in_bank[io], type_in_bank[io - 1]) == 0) {
                            type_in_bank[io - 1].q =
                                (type_in_bank[io - 1].q || 1) + (type_in_bank[io].q || 1);
                            type_in_bank.splice(io, 1);
                        }
                    }
                    a[c][1].push(type_in_bank);
                    break;
                }
    });

    for (var c = 0; c < a.length; c++) {
        let stackableItems = [];
        let unstackableItems = [];
        let stackableMap = new Map(); // Map to consolidate stackable items

        a[c][1].flat().forEach(item => {
            if (item.q && item.q > 1) {
                if (stackableMap.has(item.name + item.level)) { // Group by item name and level
                    stackableMap.set(item.name + item.level, {
                        name: item.name,
                        level: item.level,
                        q: stackableMap.get(item.name + item.level).q + item.q
                    });
                } else {
                    stackableMap.set(item.name + item.level, { name: item.name, level: item.level, q: item.q });
                }
            } else {
                unstackableItems.push(item);
            }
        });

        a[c][1] = Array.from(stackableMap, ([nameLevel, data]) => {
            if (data.q > 1000) {
                if (data.q % 1 === 0) {
                    return { name: data.name, level: data.level, q: (data.q / 1000).toFixed(0) + "k" };
                } else {
                    return { name: data.name, level: data.level, q: (data.q / 1000).toFixed(1).replace(/\.0$/, "") + "k" };
                }
            } else {
                return { name: data.name, level: data.level, q: data.q };
            }
        });

        a[c][1] = a[c][1].concat(unstackableItems);

        a[c][1] = a[c][1].sort((a, b) => (a.name > b.name ? 1 : -1)); // Sorting the items by name
    }

    render_items(a);
}

function render_items(a) {
    if (a.length > 0 && !Array.isArray(a[0])) {
        a = [["Items", a]];
    }

    let html = "<div style='border: 5px solid gray; background-color: black; padding: 10px; width: 90%; height: 90%;'>";

    a.forEach((category) => {
        html += `<div style='float:left; margin-left:5px;'><div class='gamebutton gamebutton-small' style='margin-bottom: 5px'>${category[0]}</div>`;
        html += "<div style='margin-bottom: 10px'>";

        category[1].forEach((item) => {
            let itemDiv = parent.item_container({ skin: G.items[item.name].skin, onclick: `render_item_info('${item.name}')` }, item);

            if (item.p) {
                let corner = "";
                switch (item.p) {
                    case "festive":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#79ff7e'>F</div>`;
                        break;
                    case "firehazard":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#f79b11'>H</div>`;
                        break;
                    case "glitched":
                        corner = `<div class='trruui imu' style='border-color: grey; color:grey'>#</div>`;
                        break;
                    case "gooped":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#64B867'>G</div>`;
                        break;
                    case "legacy":
                        corner = `<div class='trruui imu' style='border-color: grey; color:white'>L</div>`;
                        break;
                    case "lucky":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#00f3ff'>L</div>`;
                        break;
                    case "shiny":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#99b2d8'>S</div>`;
                        break;
                    case "superfast":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#c681dc'>U</div>`;
                        break;
                    default:
                        corner = `<div class='trruui imu' style='border-color: black; color:grey'>?</div>`;
                        break;
                }
                itemDiv = itemDiv.replace('</div></div>', `</div>${corner}</div>`);
            }

            html += itemDiv;
        });

        html += "</div></div>";
    });

    html += "<div style='clear:both;'></div></div>";
    parent.show_modal(html, { wrap: false, hideinbackground: true, url: "/docs/guide/all/items" });
}

var ui_gamelog = function () {
    var gamelog_data = {
        kills: {
            show: true,
            regex: /killed/,
            tab_name: 'Kills'
        },
        gold: {
            show: true,
            regex: /gold/,
            tab_name: 'Gold'
        },
        party: {
            show: true,
            regex: /party/,
            tab_name: 'Party'
        },
        items: {
            show: true,
            regex: /found/,
            tab_name: 'Items'
        },
        upgrade_and_compound: {
            show: true,
            regex: /(upgrade|combination)/,
            tab_name: 'Upgr.'
        },
        errors: {
            show: true,
            regex: /(error|line|column)/i,
            tab_name: 'Errors'
        }
    };
    // filter buttons are alternating lighter and darker for aesthetic effect
    // colours in order are: dark blue, light blue, white, dark gray, light gray, lighter gray
    var filter_colours = {
        on_dark: '#151342',
        on_light: '#1D1A5C',
        on_text: '#FFF',
        off_dark: '#222',
        off_light: '#333',
        off_text: '#999'
    };
    var $ = parent.$;
    init_timestamps();
    init_gamelog_filter();
    function init_gamelog_filter() {
        //$('#bottomrightcorner').find('#goldui')[0].style.lineHeight = '30px';
        $('#bottomrightcorner').find('#gamelog-tab-bar').remove();
        let gamelog_tab_bar = $('<div id="gamelog-tab-bar" class="enableclicks" />').css({
            border: '5px solid gray',
            height: '24px',
            background: 'black',
            margin: '-5px 0',
            display: 'flex',
            fontSize: '20px',
            fontFamily: 'pixel'
        });
        let gamelog_tab = $('<div class="gamelog-tab enableclicks" />').css({
            height: '100%',
            width: 'calc(100% / 6)',
            textAlign: 'center',
            lineHeight: '24px',
            cursor: 'default'
        });
        for (let key in gamelog_data) {
            if (!gamelog_data.hasOwnProperty(key)) continue;
            let filter = gamelog_data[key];
            gamelog_tab_bar.append(
                gamelog_tab
                    .clone()
                    .attr('id', `gamelog-tab-${key}`)
                    .css({
                        background: gamelog_tab_bar.children().length % 2 == 0 ? filter_colours.on_dark : filter_colours.on_light
                    })
                    .text(filter.tab_name)
                    .click(function () {
                        toggle_gamelog_filter(key);
                    })
            );
        }
        $('#gamelog').before(gamelog_tab_bar);
    }
    function filter_gamelog() {
        $('.gameentry').each(function () {
            for (let filter of Object.values(gamelog_data)) {
                if (filter.regex.test(this.innerHTML)) {
                    this.style.display = filter.show ? 'block' : 'none';
                    return;
                }
            }
        });
    }
    function toggle_gamelog_filter(filter) {
        gamelog_data[filter].show = !gamelog_data[filter].show;
        console.log(JSON.stringify(gamelog_data));
        let tab = $(`#gamelog-tab-${filter}`);
        if (gamelog_data[filter].show) {
            tab.css({
                background: $('.gamelog-tab').index(tab) % 2 == 0 ? filter_colours.on_dark : filter_colours.on_light,
                color: filter_colours.on_text
            });
        } else {
            tab.css({
                background: $('.gamelog-tab').index(tab) % 2 == 0 ? filter_colours.off_dark : filter_colours.off_dark,
                color: filter_colours.off_text
            });
        }
        filter_gamelog();
        $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight);
    }
    function pad(num, pad_amount_) {
        pad_amount = pad_amount_ || 2;
        return ("0".repeat(pad_amount) + num).substr(-pad_amount, pad_amount);
    }
    function add_log_filtered(c, a) {
        if (parent.mode.dom_tests || parent.inside == "payments") {
            return;
        }
        if (parent.game_logs.length > 1000) {
            var b = "<div class='gameentry' style='color: gray'>- Truncated -</div>";
            parent.game_logs = parent.game_logs.slice(-720);
            parent.game_logs.forEach(function (d) {
                b += "<div class='gameentry' style='color: " + (d[1] || "white") + "'>" + d[0] + "</div>"
            });
            $("#gamelog").html(b)
        }
        parent.game_logs.push([c, a]);
        let display_mode = 'block';
        for (let filter of Object.values(gamelog_data)) {
            if (filter.regex.test(c)) {
                display_mode = filter.show ? 'block' : 'none';
                break;
            }
        }
        $("#gamelog").append(`<div class='gameentry' style='color: ${a || "white"}; display: ${display_mode};'>${c}</div>`);
        $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight);
    }
    function init_timestamps() {
        if (parent.socket.hasListeners("game_log")) {
            parent.socket.removeListener("game_log");
            parent.socket.on("game_log", data => {
                parent.draw_trigger(function () {
                    let now = new Date();
                    if (is_string(data)) {
                        add_log_filtered(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} | ${data}`, "gray");
                    } else {
                        if (data.sound) sfx(data.sound);
                        add_log_filtered(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} | ${data.message}`, data.color);
                    }
                })
            });
        }
    }
}();

var startTime = new Date();
var sumGold = 0;
setInterval(function () {
    update_goldmeter();
}, 250);
function init_goldmeter() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');
    brc.find('#goldtimer').remove();
    let xpt_container = $('<div id="goldtimer"></div>').css({
        fontSize: '28px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        width: "100%"
    });
    //vertical centering in css is fun
    let xptimer = $('<div id="goldtimercontent"></div>')
        .css({
            display: 'table-cell',
            verticalAlign: 'middle'
        })
        .html("")
        .appendTo(xpt_container);
    brc.children().first().after(xpt_container);
}
function updateGoldTimerList() {
    let $ = parent.$;
    var gold = getGold();
    var goldString = "<div>" + gold + " Gold/Hr" + "</div>";
    $('#' + "goldtimercontent").html(goldString).css({
        background: 'black',
        border: 'solid gray',
        borderWidth: '5px 5px',
        height: '34px',
        lineHeight: '34px',
        fontSize: '30px',
        color: '#FFD700',
        textAlign: 'center',
    });
}
function update_goldmeter() {
    updateGoldTimerList();
}
init_goldmeter()
function getGold() {
    var elapsed = new Date() - startTime;
    var goldPerSecond = parseFloat(Math.round((sumGold / (elapsed / 1000)) * 100) / 100);
    return parseInt(goldPerSecond * 60 * 60).toLocaleString('en');
}
//Clean out an pre-existing listeners
if (parent.prev_handlersgoldmeter) {
    for (let [event, handler] of parent.prev_handlersgoldmeter) {
        parent.socket.removeListener(event, handler);
    }
}
parent.prev_handlersgoldmeter = [];
//handler pattern shamelessly stolen from JourneyOver
function register_goldmeterhandler(event, handler) {
    parent.prev_handlersgoldmeter.push([event, handler]);
    parent.socket.on(event, handler);
};
function goldMeterGameResponseHandler(event) {
    if (event.response == "gold_received") {
        sumGold += event.gold;
    }
}
function goldMeterGameLogHandler(event) {
    if (event.color == "gold") {
        var gold = parseInt(event.message.replace(" gold", "").replace(",", ""));
        sumGold += gold;
    }
}
register_goldmeterhandler("game_log", goldMeterGameLogHandler);
register_goldmeterhandler("game_response", goldMeterGameResponseHandler);

if (parent.party_style_prepared) {
    parent.$('#style-party-frames').remove();
}

let css = `
        .party-container {
            position: absolute;
            //top: 0px;
            left: 0%;
            width: 540px;
            height: 300px;
            transform: translate(-20%, 0);
        }
    `;
parent.$('head').append(`<style id="style-party-frames">${css}</style>`);
parent.party_style_prepared = true;

const includeThese = ['mp', 'max_mp', 'hp', 'max_hp', 'name', 'max_xp', 'name', 'cc', 'xp', 'level'];
const partyFrameWidth = 80; // Set the desired width for the party frames

function updatePartyData() {
    let myInfo = Object.fromEntries(Object.entries(character).filter(current => { return character.read_only.includes(current[0]) || includeThese.includes(current[0]); }));
    myInfo.lastSeen = Date.now();
    set(character.name + '_newparty_info', myInfo);
}

setInterval(updatePartyData, 100);

function getIFramedCharacter(name) {
    for (const iframe of top.$('iframe')) {
        const char = iframe.contentWindow.character;
        if (!char) continue; // Character isn't loaded yet
        if (char.name == name) return char;
    }
    return null;
}

let show_party_frame_property = {
    img: true,
    hp: true,
    mp: true,
    xp: true,
    cc: false,
};

function get_toggle_text(key) {
    return key.toUpperCase() + (show_party_frame_property[key] ? '✔️' : '❌');
}

function update_toggle_text(key) {
    const toggle = parent.document.getElementById('party-props-toggles-' + key);
    toggle.textContent = get_toggle_text(key);
}

function addPartyFramePropertiesToggles() {
    if (parent.document.getElementById('party-props-toggles')) {
        return;
    }

    const toggles = parent.document.createElement('div');
    toggles.id = 'party-props-toggles';
    toggles.classList.add('hidden');
    toggles.style = `
	display: block;
	background-color: black;
	margin-top: 0px;
	`;

    function create_toggle(key) {
        const toggle = parent.document.createElement('button');
        toggle.id = 'party-props-toggles-' + key;
        toggle.setAttribute('data-key', key);
        toggle.style =
            "border: 2px #ccc solid; background-color: #000; color: #ccc";
        toggle.setAttribute(
            'onclick',
            "parent.code_eval(\`show_party_frame_property['" + key + "'] = !show_party_frame_property['" + key + "']; update_toggle_text('" + key + "')\`);"
        );
        toggle.appendChild(parent.document.createTextNode(get_toggle_text(key)));
        return toggle;
    }

    for (let key of ['img', 'hp', 'mp', 'xp', 'cc']) {
        toggles.appendChild(create_toggle(key));
    }

    //let party = parent.document.getElementById('newparty');
    //let party_parent = party.parentNode;
    //party_parent.append(toggles);

    const rightBottomMenu = parent.document.getElementById("bottomrightcorner");
    const gameLogUi = parent.document.getElementById("gamelog");
    rightBottomMenu.insertBefore(toggles, gameLogUi);

}

function updatePartyFrames() {
    let $ = parent.$;
    let partyFrame = $('#newparty');
    partyFrame.addClass('party-container');

    if (partyFrame) {
        addPartyFramePropertiesToggles();

        for (let x = 0; x < partyFrame.children().length; x++) {
            let party_member_name = Object.keys(parent.party)[x];
            let info = get(party_member_name + '_newparty_info');
            if (!info || Date.now() - info.lastSeen > 1000) {
                let iframed_party_member = getIFramedCharacter(party_member_name);
                if (iframed_party_member) {
                    info = Object.fromEntries(Object.entries(iframed_party_member).filter(current => { return character.read_only.includes(current[0]) || includeThese.includes(current[0]); }));
                } else {
                    let party_member = get_player(party_member_name);
                    if (party_member) {
                        info = Object.fromEntries(Object.entries(party_member).filter(current => { return includeThese.includes(current[0]); }));
                    } else {
                        info = { name: party_member_name };
                    }
                }
            }

            let infoHTML = `<div style="width: ${partyFrameWidth}px; height: 20px; margin-top: 3px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${info.name}</div>`;

            info.max_cc = 200;

            let hpWidth = 0;
            let mpWidth = 0;
            let hp = '??';
            let mp = '??';
            if (info.hp !== undefined) {
                hpWidth = info.hp / info.max_hp * 100;
                mpWidth = info.mp / info.max_mp * 100;
                hp = info.hp;
                mp = info.mp;
            }

            let xpWidth = 0;
            let xp = '??';
            if (info.xp !== undefined) {
                let lvl = info.level;
                let max_xp = G.levels[lvl];
                xpWidth = info.xp / max_xp * 100;
                xp = xpWidth.toFixed(2) + '%';

                //const billion = 1_000_000_000;
                //xp = (info.xp / billion).toFixed(1) + 'b/' + (max_xp / billion).toFixed(0) + 'b';
            }

            let ccWidth = 0;
            let cc = '??';
            if (info.cc !== undefined) {
                ccWidth = info.cc / info.max_cc * 100;
                cc = info.cc.toFixed(2);
            }

            let data = {
                hp: hp,
                hpWidth: hpWidth,
                hpColor: 'red',
                mp: mp,
                mpWidth: mpWidth,
                mpColor: 'blue',
                xp: xp,
                xpWidth: xpWidth,
                xpColor: 'green',
                cc: cc,
                ccWidth: ccWidth,
                ccColor: 'grey',
            };

            for (let key of ['hp', 'mp', 'xp', 'cc']) {
                const text = key.toUpperCase();
                const value = data[key];
                const width = data[key + 'Width'];
                const color = data[key + 'Color'];
                if (show_party_frame_property[key]) {
                    infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 3px;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 20px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">${text}: ${value}</div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${color}; width: ${width}%; height: 20px; transform: translate(0, 0); border: 1px solid grey;"></div>
</div>`;
                }
            }

            let party_member_frame = partyFrame.find(partyFrame.children()[x]);
            party_member_frame.children().first().css('display', show_party_frame_property['img'] ? 'inherit' : 'none');
            party_member_frame.children().last().html(`<div style="font-size: 22px;" onclick='pcs(event); party_click("${party_member_name}\");'>${infoHTML}</div>`);
        }
    }
}

parent.$('#party-props-toggles').remove();

setInterval(updatePartyFrames, 250);

setInterval(function () {
    update_xptimer();
}, 250);
var minute_refresh;
function init_xptimer(minref) {
    minute_refresh = minref || 1;
    parent.add_log(minute_refresh.toString() + ' min until tracker refresh!', 0x00FFFF);
    let $ = parent.$;
    let brc = $('#bottomrightcorner');
    brc.find('#xptimer').remove();
    let xpt_container = $('<div id="xptimer"></div>').css({
        background: 'black',
        border: 'solid gray',
        borderWidth: '5px 5px',
        width: '320px',
        height: '96px',
        fontSize: '28px',
        color: '#00FF00',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px'
    });
    let xptimer = $('<div id="xptimercontent"></div>')
        .css({
            display: 'table-cell',
            verticalAlign: 'middle'
        })
        .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 40px !important; line-height: 28px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
        .appendTo(xpt_container);
    brc.children().first().after(xpt_container);
}
var last_minutes_checked = new Date();
var last_xp_checked_minutes = character.xp;
var last_xp_checked_kill = character.xp;
function update_xptimer() {
    if (character.xp == last_xp_checked_kill) return;
    let $ = parent.$;
    let now = new Date();
    let time = Math.round((now.getTime() - last_minutes_checked.getTime()) / 1000);
    if (time < 1) return;
    let xp_rate = Math.round((character.xp - last_xp_checked_minutes) / time);
    if (time > 60 * minute_refresh) {
        last_minutes_checked = new Date();
        last_xp_checked_minutes = character.xp;
    }
    last_xp_checked_kill = character.xp;
    let xp_missing = parent.G.levels[character.level] - character.xp;
    let seconds = Math.round(xp_missing / xp_rate);
    let minutes = Math.round(seconds / 60);
    let hours = Math.round(minutes / 60);
    let counter = `${hours}h ${minutes % 60}min`;
    $('#xpcounter').text(counter);
    $('#xprate').text(`${ncomma(xp_rate)} XP/s`);
}
function ncomma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
init_xptimer(5)