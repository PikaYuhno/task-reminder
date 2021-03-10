import { Message, Client, MessageEmbed } from "discord.js";
import { sort } from '../utils/utils';
import api from '../dao/routes';
import * as simple_node_logger from 'simple-node-logger';
const logger = simple_node_logger.createSimpleLogger({ logFilePath: 'project.log', timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS' });

export default class List {
    private _client: Client;
    private _cmd: string;
    private _args: string[];
    private _msg: Message;

    private _admin: boolean = false;

    constructor(client: Client, cmd: string, args: string[], msg: Message) {
        this._client = client;
        this._cmd = cmd;
        this._args = args;
        this._msg = msg;
    }

    public async run() {
        logger.info(`Running Command: ${this._cmd} with Arguments: ${this._args.join(" ")}`);

        let allData = api.findAll();
        console.log(allData);

        sort(allData);

        let fields: IField[] = [];

        for (let i = 0; i < allData.length; i++) {
            let value = `Abgabe-Platform: \`${allData[i].platform}\`\nDeadline: \`${allData[i].deadline}\`\nAufgabe-ID: \`${allData[i].id}\``
            fields.push({ name: allData[i].fach, value })
        }

        const listEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Alle Aufgaben')
            .addFields(fields)
            .setTimestamp()
            .setFooter(`Requested by ${this._msg.author.tag}`);
        this._msg.channel.send(listEmbed);
    }
}

interface IField {
    name: string;
    value: string;
}