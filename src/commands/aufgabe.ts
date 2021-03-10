import { Message, Client, MessageEmbed } from 'discord.js';
import { getChannel, executeCronJob } from '../utils/utils';
import AufgabeModel from '../model/aufgabe.model';
import api from '../dao/routes';
import * as simple_node_logger from 'simple-node-logger';
const logger = simple_node_logger.createSimpleLogger({ logFilePath: 'project.log', timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS' });

export default class Aufgabe {
    private _client: Client;
    private _cmd: string;
    private _args: string[];
    private _msg: Message;

    private _admin: boolean = true;

    readonly _help = '!aufgabe <opartion> <Abgabe-Platform> <Fach> <"yyyy.MM.dd hh:mm">';

    constructor(client: Client, cmd: string, args: string[], msg: Message) {
        this._client = client;
        this._cmd = cmd;
        this._args = args;
        this._msg = msg;
    }

    public async run() {
        logger.info(`Running Command: ${this._cmd} with Arguments: ${this._args.join(" ")}`);

        if (this._args.length <= 0) {
            const helpEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Aufgabe Command')
                .addFields(
                    { name: 'Aufgabe hinzufuegen', value: '\`!aufgabe add <platform> <fach> "yyyy.MM.dd hh:mm"\`' },
                    { name: 'Aufgabe bearbeiten', value: '\`!aufgabe update <id> "yyyy.MM.dd hh:mm"\`' },
                    { name: 'Aufgabe loeschen', value: '\`!aufgabe delete <id>\`' }
                )
                .setTimestamp()
                .setFooter(`Requested by ${this._msg.author.tag}`);
            return this._msg.reply(helpEmbed);
        }

        let operation = this._args[0];
        switch (operation) {
            case "add":
                this.add();
                break;
            case "update":
                this.update();
                break;
            case "delete":
                this.delete();
                break;
            default:
                this._msg.reply('Nur diese Operationen sind verfügbar: add, update, delete')
        }


    }
    //!aufgabe add <platform> <fach> "<date>"
    private async add() {
        this._args.shift();
        let argStr: string = this._args.join(" ");
        let deadline = this.checkDeadline(argStr);
        if (typeof deadline !== "string") {
            return;
        }
        let aufgabeModel = new AufgabeModel(this._args[0], this._args[1], deadline, null);
        this._msg.channel.send(`Aufgabe wurde erfolgreich hochgeladen! ID: \`${aufgabeModel.id}\`\nFach:\`${this._args[1]}\`\nAbgabe-Platform:\`${this._args[0]}\n\`Deadline:\`${deadline}\``)
            .then(msg => {
                msg.react('✅');
            });
        await getChannel('aufgaben', this._client).send(`<@&${this._client['config'].studentRole}>\n**Neue Aufgabe!** ID: \`${aufgabeModel.id}\`\nFach:\`${this._args[1]}\`\nAbgabe-Platform:\`${this._args[0]}\n\`Deadline:\`${deadline}\``);
        api.insert(aufgabeModel);
        executeCronJob(this._client, aufgabeModel);
    }

    //!aufgabe update <id> "<new Date>"
    private update() {
        this._args.shift();
        let id = this._args[0];
        let argStr = this._args.join(" ");
        let deadline = this.checkDeadline(argStr);
        if (typeof deadline !== "string") {
            return;
        }
        if (!api.exists(id)) {
            logger.warn(id, 'Existiert nicht!')
            return this._msg.reply(`Diese ID existiert nicht!`);;
        }
        let crons = this._client['cronJobs'].get(id);
        crons.cronJob.destroy();
        crons.cronJobPrev.destroy();
        let aufgabeModel = api.findById(id);
        let updatedAufgabe = new AufgabeModel(aufgabeModel.platform, aufgabeModel.subject, deadline, aufgabeModel.moodleId, aufgabeModel.id);
        api.updateById(id, updatedAufgabe);
        executeCronJob(this._client, updatedAufgabe);
        this._msg.channel.send(`Aufgabe mit der ID: \`${id}\` wurde erfolgreich **bearbeitet**!`)
            .then(msg => {
                msg.react('✅');
            });
        console.log(this._client['cronJobs']);
    }

    //!aufgabe delete <id>
    private delete() {
        this._args.shift();
        let id = this._args[0];
        if (!api.exists(id)) {
            logger.warn(id, 'Existiert nicht!')
            return this._msg.reply(`Diese ID existiert nicht!`);
        }
        let crons = this._client['cronJobs'].get(id);
        crons.cronJob.destroy();
        crons.cronJobPrev.destroy();
        api.deleteById(id);
        this._client['cronJobs'].delete(id);
        this._msg.channel.send(`Aufgabe mit der ID: \`${id}\` wurde erfolgreich **geloescht**!`)
            .then(msg => {
                msg.react('✅');
            });
    }

    private checkDeadline(arg: string) {
        console.log("date:", arg);
        let deadlineStr = arg.match(/"\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}"/g);
        if (deadlineStr == null) {
            logger.warn(`${deadlineStr} kein gueltiges Datum!`)
            return this._msg.reply(`Bitte ein gueltiges Datum eingeben. Format: ${this._help}`);
        }
        let deadline: string = deadlineStr[0].slice(1, -1);
        let dateObject = new Date(deadline);
        if (dateObject.getTime() < Date.now()) {
            logger.warn(`${deadline} Darf nicht in der Vegangenheit liegen!`)
            return this._msg.reply("❌ Deadline darf nicht in der Vergangenheit liegen!");
        }
        return deadline;
    }
}