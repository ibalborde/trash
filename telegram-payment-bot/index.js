
const Telegraf = require('telegraf')
const { Markup } = Telegraf

const app = new Telegraf('928495508:AAE5EVMIufeszYFPEU4UofXl16xmMAL13Ac')
const PAYMENT_TOKEN = '284685063:TEST:OGM2NzdkYjVjZjAw'
var UserChatId;
const UserChatIdSaved = 958018952;
var message;

//app.telegram.sendMessage(UserChatIdSaved,'Tengo tu ID :D')

const products = [
    {
        name: 'Medico 1',
        price: 100,
        description: 'Muy simpatico',
        photoUrl: 'https://imagenes.milenio.com/pW8hbvM-VwXmYaM_1O3zTDAOTGg=/958x596/smart/https://www.milenio.com/uploads/media/2017/10/23/cada-de-octubre-celebramos-a.jpg'
    },
    {
        name: 'Medico 2',
        price: 60,
        description: 'Menos simpatico',
        photoUrl: 'https://www.wallstreetenglish.com.ar/hs-fs/hubfs/WSE%20-%20FB%20-%2007032017%20-%20Vocabulario%20para%20médicos.jpg?width=711&height=372&name=WSE%20-%20FB%20-%2007032017%20-%20Vocabulario%20para%20médicos.jpg'
  }
]

function createInvoice (product) {
    return {
        provider_token: PAYMENT_TOKEN,
        start_parameter: 'foo',
        title: product.name,
        description: product.description,
        currency: 'ARS',
        photo_url: product.photoUrl,
        is_flexible: false,
        need_shipping_address: false,
        prices: [{ label: product.name, amount: Math.trunc(product.price * 100) }],
        payload: {}
    }
}

// Start command
app.command('start', ({ reply }) => reply('Bienvenido, blablabla '))

// Show offer
app.hears(/^que.*/i, ({ replyWithMarkdown }) => replyWithMarkdown(`
Tengo medicos :D


${products.reduce((acc, p) => 
         acc += `*${p.name}* - $${p.price} \n`, '')}    
Cual te gusta más?`,
    Markup.keyboard(products.map(p => p.name)).oneTime().resize().extra()
))

// Order product
products.forEach(p => {
    app.hears(p.name, (ctx) => {
        UserChatId = ctx.message.chat.id
        console.log(`${ctx.from.first_name} is about to buy a ${p.name}. Este seria el id = ` + UserChatId)
    
        ctx.replyWithInvoice(createInvoice(p))
        ctx.forwardMessage(UserChatId, UserChatId, false, 0)
        console.log("dat " + ctx.telegram.getChat(UserChatId))
        //app.telegram.sendMessage(UserChatId, message);

    })
})

// Handle payment callbacks
app.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))
app.on('successful_payment', (ctx) => {
    console.log(`${ctx.from.first_name} (${ctx.from.username}) just payed ${ctx.message.successful_payment.total_amount / 100} €.`)
})

app.startPolling()