const [font_size, line_height] = [16, 16]
const chat_input_height = 16
const padding_around = 2
const window_width = 320
const window_background = '#000000CC'

const g_document = window.parent.document

// TODO: Add 'hide' button
const redesign_webkit_scrollbar = () => {
    const to_insert = {
        '.noscroll': ['border: 2px solid #00000000'],
        '.noscroll::-webkit-scrollbar': ['background: #00000000', 'width: 6px'],
        '.noscroll::-webkit-scrollbar-thumb': ['border: 2px solid #00000000', 'border-radius: 20px'],
    }

    for (let [selector, properties] of Object.entries(to_insert)) {
        for (let property of properties) {
            g_document.styleSheets[0].insertRule(`${selector} {${property} !important}`, document.styleSheets[0].cssRules.length)
        }
    }
}
const redesign_bottomleftcorner2 = () => {

    let $ = parent.$
    let blc2 = $('#bottomleftcorner2')

    blc2.css({
        bottom: `${chat_input_height + padding_around}px`,
        left: `${padding_around}px`,
        width: `${window_width}px`,
    })
    blc2.find('#chatlog').css({
        fontSize: `${font_size}px`,
        lineHeight: `${line_height}px`,
        background: window_background,
        border: 'none',
        padding: 'none',
    })

    // Stop weird padding
    const to_insert = {
        '.chatentry+.chatentry': ['margin-top: 0'],
        '.chatentry': ['margin-bottom: 0'],
    }

    for (let [selector, properties] of Object.entries(to_insert)) {
        for (let property of properties) {
            g_document.styleSheets[0].insertRule(`${selector} {${property} !important}`, document.styleSheets[0].cssRules.length)
        }
    }

    $('body').on('DOMNodeInserted', (e) => {
        if ($(e.target).attr('id') == 'chatwparty') $('#chatwparty').css({ display: 'none' })
    })

    blc2.find('.timeui.clickable').remove()


    const create_dataline = () => {
        blc2.find('div#dataline').html('')
        blc2.find('div#dataline').empty()
        blc2.find('.coords').remove()

        const server_name = `<span class='u_servername'>${parent.server_name}</span>`
        const map_name = `<span class='u_mapname'>${get_map().name}</span>`
        const map_key = `<span class='u_mapkey'>${parent.current_map}</span>`
        const coordinates = `<span class='u_coordinates'>${character.x.toFixed(0)}, ${character.y.toFixed(0)}</span>`

        blc2.find('#dataline')
            .css({ display: 'flex', 'justify-content': 'space-around', background: '#000000AA' })
            .append(server_name)
            .append(map_name)
            .append(map_key)
            .append(coordinates)
    }

    const update_coordinates = () => {
        blc2.find('.u_coordinates').html(`${character.x.toFixed(0)}, ${character.y.toFixed(0)}`)
    }
    const update_dataline = () => {
        blc2.find('.u_servername').html(`${parent.server_name}`)
        blc2.find('.u_mapname').html(`${get_map().name}`)
        blc2.find('.u_mapkey').html(`${parent.current_map}`)
    }



    blc2.find('div.clickable')
        .attr('id', 'dataline')
        .removeClass('clickable')
        .prop('onclick', null)
        .off('click')

    create_dataline()
    setInterval(update_coordinates, 50)

    character.on('new_map', (data) => {
        update_dataline()
    })


    blc2.find('#dataline').css({
        fontSize: `${font_size}px`,
        lineHeight: `${line_height}px`,
        background: '#000000AA',
        border: 0,
        'border-bottom': '2px solid white',
        padding: 0,
        'padding-bottom': '2px',
        margin: 0,
        width: `${window_width + 4}px`,
    })

    $('#chatinput').css({
        fontSize: `${font_size}px`,
        lineHeight: `${line_height}px`,
        background: '#000000CC',
        padding: 'none',
        left: `${padding_around}px`,
        bottom: `${padding_around}px`,
        height: `${chat_input_height}px`,
        width: `${window_width + 4}px`,
        padding: 0,
        'border-top': '2px solid white',
    })

    $('#chatwparty').css({
        display: 'none',
    })
}
//
const redesign_bottomrightcorner = () => {
    let $ = parent.$
    let brc = $('#bottomrightcorner')
    brc.css({
        bottom: `${padding_around}px`,
        right: `${padding_around}px`,
        width: `${window_width + 4}px`,
    })
    brc.find('#gamelog').css({
        fontSize: `${font_size}px`,
        lineHeight: `${line_height}px`,
        background: window_background,
        border: '2px solid transparent',
        padding: 'none',
        'border-style': 'none',
    })
    brc.find('#chatlog#gameentry').each(() => {
        $(this).css({
            margin: 0,
        })
    })
}

redesign_webkit_scrollbar()
redesign_bottomleftcorner2()
redesign_bottomrightcorner()