import { Client, Message } from 'discord.js';
const client = new Client();

import * as simple_node_logger from 'simple-node-logger';
const logger = simple_node_logger.createSimpleLogger({ logFilePath: 'project.log', timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS' });

import * as dotenv from 'dotenv';
dotenv.config();

const commands = ["help", "aufgabe", "list"];
const prefix = "!";

import config from './config.json';

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
    client.user.setActivity('!help', { type: 'WATCHING' }).catch(console.error);
    client['cronJobs'] = new Map();
    config.forEach(it => {
        client['config'] = it;
    });
});

client.on('message', async (msg: Message) => {
    if (msg.author.bot) return;
    if (msg.content.indexOf(prefix) == -1) return;

    if (msg.mentions.users.has(client.user.id))
        return msg.reply('Mein Prefix ist `!`, versuch `!help` fuer mehr infos!');

    let args = msg.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();
    for (let c of commands) {
        if (c == cmd) {

            let command = await import(`./commands/${c}`);
            let instance = new command.default(client, cmd, args, msg);

            if (instance._admin) {
                let userRoles = Array.from(msg.member.roles.cache.keys());
                if (!userRoles.find(e => {
                    return client['config'].adminRoles.includes(e);
                })) {
                    return msg.reply("Sorry, you don't have permissions to use this!");
                } else {
                    instance.run();
                }
            } else {
                instance.run();
            }
        }
    }
});

client.login(process.env.CLIENT_TOKEN);
