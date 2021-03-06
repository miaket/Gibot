var identifyAction = require('./ragnarok/identifyAction.js').identifyAction;
var listMvpTimer = require('./ragnarok/listMvpTimer.js').listMvpTimer;
var insertMvpTimer = require('./ragnarok/insertMvpTimer.js').insertMvpTimer;

/**
 * Módulo de ações do Ragnarok
 * @module bot/ragnarok
 */

/**
 * Valor que armaneza o prefixo a ser utilizado em toda a requisição das APIs do Ragnarok.
 * @readonly
 * @const {string}
 */
RAGNAROK_PREFIX = process.env.NODE_ENV=='development'?'http://localhost:3101/ragnarok/':process.env.SERVER_URL + ':' + process.env.PORT + '/ragnarok/';

/**
 * Enum para as possíveis ações no Ragnarok.
 * @readonly
 * @enum {string}
 */
RagnarokActions = {
	LIST: 'list',
    INSERT: 'insert'
};

/**
 * Executa uma ação do Ragnarok utilizando as APIs do mesmo.
 * Receba uma mensagem enviada pelo Telegram, avalia a ação e executa caso tudo esteja de acordo
 *
 * @param {object} msg - Mensagem enviada para o bot solicitando ação no Ragnarok.
 * @param {object} msg.chat - Informações do chat em que a solicitação aconteceu.
 * @param {integer} msg.chat.id - ID do chat em que a solicitação ocorreu.
 * @param {object} msg.from - Informações sobre a pessoa que realizou a solicitação.
 * @param {integer} msg.from.id - ID da pessoa que solicitou a ação.
 * @param {string[]} match - Array com todas as informações da requisição (após o /r).
 * @return {bot.sendMessage} - Retorna a execução da resposta no Telegram.
 */
exports.executeRagnarokAction = (msg, match) => {

    var chatId = msg.chat.id;

    try {

        var request = match[1].split(';');

        /*  Quebra toda a requisição em um array separado por ";" */
        resp = {
            
            action: request[0],
            mvpName: request[1],
            killTime: request[2]
            
        };
    
    } catch (e) {

        return bot.sendMessage(chatId, 'Comando do ragnarok inválido. Tente enviar o comando com a seguinte sintaxe: /r "Ação desejada"');

    }

    /*  Avaliamos se a ação é uma ação válida do Ragnarok/bot */
    if (!telegram.validation.isValidRagnarokAction(resp)) {

        return bot.sendMessage(chatId, 'Comando do ragnarok inválido. Tente enviar o comando com a seguinte sintaxe: /r "Ação desejada"');

    } else {

        /*  Verificamos qual a ação solicitada, encaminhamos para a função da ação e enviamos a resposta */
        switch (identifyAction(resp.action.toLowerCase().trim())) {

            case RagnarokActions.LIST:

                listMvpTimer().then((mvpTimers) => {

                    return bot.sendMessage(chatId, mvpTimers);

                }, (err) => {

                    //	TODO: Melhorar isso
                    return bot.sendMessage(chatId, 'Erro ao listar os timers dos MVPs.');

                });

                break;

            case RagnarokActions.INSERT:

                if (telegram.validation.isValidMvpInfo(resp)) {
            
                    insertMvpTimer(resp).then((message) => {

                        return bot.sendMessage(chatId, message);

                    }, (err) => {

                        if (err) {

                            return bot.sendMessage(chatId, err);

                        } else {

                            return bot.sendMessage(chatId, 'Ocorreu um erro ao inserir o timer do MVP.');

                        }

                    });

                } else {

                    return bot.sendMessage(chatId, 'As informações do MVP não estão no formato incorreto. As informações devem ser enviadas como /r insert;"Nome do MVP";"Horário da morte em hh:mm"');

                }

                break;

            default:
                return bot.sendMessage(chatId, 'Essa ação não é válida. Por enquanto eu sei apenas listar.');
                break;

        }
    }
};
