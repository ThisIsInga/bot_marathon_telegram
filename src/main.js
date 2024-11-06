// подключение библиотек:
const {HtmlTelegramBot, userInfoToString} = require("./bot");
const ChatGptService = require("./gpt");

class MyTelegramBot extends HtmlTelegramBot {
    constructor(token) {
        super(token);
        // когда мы вводим команды - мы переключаем режимы:
        this.mode = null;
        //переписка пользователя:
        this.list = [];
        //ответ пользователя:
        this.user = {};
        //для вопросов в profile (1,2,3,4,5)
        this.count = 0;
    }

    async start(msg){
        this.mode = 'main'
        // подключаем текст с messages/main.txt
        const text = this.loadMessage('main')
        // подключаем картинку с images/main.jpg
        await this.sendImage('main')
        await this.sendText(text)

        //menu
        await this.showMainMenu({
            'start': 'main menu bot',
            'profile': 'Tinder profile generation',
            'opener': 'Dating message 🥰',
            'message': 'Correspondence on your behalf 😈',
            'date': 'Correspondence with stars 🔥',
            'gpt': 'talk with gpt',
            'html': 'html',
        })
    }

    async html(msg) {
        await this.sendHTML('<h3 style="color: red"> Привет! </h3>')
        const html = this.loadHtml('main')
        await this.sendHTML(html, {theme: 'dark'})
        await this.sendHTML(html, {theme: 'light'})
    }

    async gpt(msg){
        this.mode = 'gpt'
        const text = this.loadMessage('gpt')
        await this.sendImage('gpt')
        await this.sendText(text)
    }

    async gptDialog(msg){
        const text = msg.text;
        const myMessage = await this.sendText('Подождите...')
        const answer = await chatgpt.sendQuestion('Ответьте на вопросы', text)
        await this.editText(myMessage, answer)
    }

    async date(msg){
        this.mode = 'date'
        const text = this.loadMessage('date')
        await this.sendImage('date')
        //делаем кнопки:
        await this.sendTextButtons(text, {
            'date_grande':'Ариана Гранде',
            'date_robbie':'Марго Робби',
            'date_zendaya':'Зендея',
            'date_gosling':'Райан Гослинг',
            'date_hardy':'Том Харди',

        })
    }

    async dateButton(callbackQuery){
        const query = callbackQuery.data;
        await this.sendImage(query)
        await this.sendText('Прекрасный выбор!')
        const prompt = this.loadPrompt(query)
        chatgpt.setPrompt(prompt)
    }

    async dateDialog(msg){
        const text = msg.text
        const myMessage = await this.sendText('Подождите')
        const answer = await chatgpt.addMessage(text)
        //редактируем сообщение
        await this.editText(myMessage, answer)
    }

    async message(msg) {
        this.mode = 'message'
        const text = this.loadMessage('message')
        await this.sendImage('message')
        await this.sendTextButtons(text, {
            'message_next':'Следующее сообщение',
            'message_date':'Пригласить на свидание',
        })
        this.list = []
    }

    async messageButton(callbackQuery) {
        const query = callbackQuery.data;
        const prompt = this.loadPrompt(query)
        const userChatHistory = this.list.join('\n\n');
        const myMessage = await this.sendText('Подождите...')
        const answer = await chatgpt.sendQuestion(prompt, userChatHistory)
        await this.editText(myMessage, answer)
    }

    async messageDialog(msg) {
        const text = msg.text
        this.list.push(text)
    }

    async profile(msg){
        this.mode = 'profile'
        const text = this.loadMessage('profile')
        await this.sendImage('profile')
        await this.sendText(text)

        this.user = {}
        await this.sendText('Сколько тебе лет?')
    }

    async profileDialog(msg){
        const text = msg.text
        this.count++;

        if (this.count === 1) {
            this.user['age'] = text;
            await this.sendText('Чем ты занимаешься?')
        }
        if (this.count === 2) {
            this.user['occupation'] = text;
            await this.sendText('Какие у тебя хобби?')
        }
        if (this.count === 3) {
            this.user['hobby'] = text;
            await this.sendText('Что тебе не нравится в людях?')
        }
        if (this.count === 4) {
            this.user['annoys'] = text;
            await this.sendText('Какая цель встречи?')
        }
        if (this.count === 5) {
            this.user['goals'] = text;

            //отправляем чату gpt
            const prompt = this.loadPrompt('profile')
            const info = userInfoToString(this.user);

            const myMessage = await this.sendText('Подождите...')

            const answer = await chatgpt.sendQuestion(prompt, info);
            await this.editText(myMessage, answer)

        }
    }


    async opener(msg){
        this.mode = 'opener'
        const text = this.loadMessage('opener')
        await this.sendImage('opener')
        await this.sendText(text)

        this.user = {}
        await this.sendText('Какое имя у девушки?')
    }

    async openerDialog(msg){
        const text = msg.text
        this.count++;

        if (this.count === 1) {
            this.user['name'] = text;
            await this.sendText('Сколько ей лет?')
        }
        if (this.count === 2) {
            this.user['age'] = text;
            await this.sendText('Оцените её внешность: 1-10')
        }
        if (this.count === 3) {
            this.user['handsome'] = text;
            await this.sendText('Чем она занимается?')
        }
        if (this.count === 4) {
            this.user['occupation'] = text;
            await this.sendText('Какая цель встречи?')
        }
        if (this.count === 5) {
            this.user['goals'] = text;

            //отправляем чату gpt
            const prompt = this.loadPrompt('opener')
            const info = userInfoToString(this.user);

            const myMessage = await this.sendText('Подождите...')

            const answer = await chatgpt.sendQuestion(prompt, info);
            await this.editText(myMessage, answer)
        }
    }

    // Мы будем писать тут наш код
    async hello(msg) {
        if (this.mode === 'gpt')
            await this.gptDialog(msg);
        else if (this.mode === 'date')
            await this.dateDialog(msg);
        else if (this.mode === 'message')
            await this.messageDialog(msg);
        else if (this.mode === 'profile')
            await this.profileDialog(msg);
        else if (this.mode === 'opener')
            await this.openerDialog(msg);
        else{
            const text = msg.text;
            //что будет писать бот
            await this.sendText('<b>Привет</b>')
            await this.sendText('<i>Как ты?</i>')
            await this.sendText(`Вы написали: ${text}`)

            await this.sendImage('avatar_main')

            await this.sendTextButtons('Какая у тебя тема в телеграмме?', {
                'theme_light':'Светлая',
                'theme_dark':'Темная',
            })
        }

    }

    async helloButton(callbackQuery) {
        //вытаскиваем уникальное имя кнопки:
        const query = callbackQuery.data;
        if(query === 'theme_light')
            await this.sendText('У вас светлая тема')
        else if (query === 'theme_dark')
            await this.sendText('У вас темная тема')
    }
}

// обьект телеграмм-бота:
const chatgpt = new ChatGptService('#')
const bot = new MyTelegramBot("#");
// Мы будем писать тут наш код
// записываем команду /start /html /gpt:
bot.onCommand( /\/start/ , bot.start)
bot.onCommand( /\/html/ , bot.html)
bot.onCommand( /\/gpt/ , bot.gpt)
bot.onCommand( /\/date/ , bot.date)
bot.onCommand( /\/message/ , bot.message)
bot.onCommand( /\/profile/ , bot.profile)
bot.onCommand( /\/opener/ , bot.opener)
//подключаем нашу функцию hello с MyTelegramBot:
bot.onTextMessage(bot.hello)
// ^ - начало строки
// . - любое количество
// * - любые символы
bot.onButtonCallback( /^date_.*/ , bot.dateButton)
bot.onButtonCallback( /^message_.*/ , bot.messageButton)
bot.onButtonCallback( /^.*/ , bot.helloButton)