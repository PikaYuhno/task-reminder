import { TextChannel } from 'discord.js';
import AufgabeModel from '../model/aufgabe.model';
import cron from 'node-cron';
import api from '../dao/routes';

export const getChannel = (channelName, client) => {
    let channel = <TextChannel>client.channels.cache.find(chn => {
        if (chn.type === 'text') {
            let textChannel = <TextChannel>chn;
            if (textChannel.name === channelName)
                return true;
        }
    });
    return channel;
}

export const executeCronJob = async (client, aufgabe: AufgabeModel) => {
    let date = new Date(aufgabe.deadline);
    let cronTime = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
    let cronJob = cron.schedule(cronTime, async () => {
        let channel = getChannel(client['config'].channelName, client);
        let message = await channel.send(`<@&${client['config'].studentRole}> Die Zeit ist abgelaufen!\nFach:\`${aufgabe.subject}\`\nAbgabe-Platform:\`${aufgabe.platform}\n\`Deadline:\`${aufgabe.deadline}\``)
        message.react('🗑️');
        api.deleteById(aufgabe.id);
        client['cronJobs'].delete(aufgabe.id);
    });
    let prevCron = await executeCronJobPrev(client, aufgabe);
    client['cronJobs'].set(aufgabe.id, { "cronJob": cronJob, "cronJobPrev": prevCron });
    console.log(`CronJob created! ID: ${aufgabe.id}, Time: ${cronTime}`);
}
const executeCronJobPrev = async (client, aufgabe: AufgabeModel) => {
    let date = new Date(aufgabe.deadline);
    date.setDate(date.getDate() - 1);
    let cronTime = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
    let cronJob = cron.schedule(cronTime, async () => {
        let channel = getChannel(client['config'].channelName, client);
        let message = await channel.send(`<@&${client['config'].studentRole}> Ihr habt nur noch 1 Tag Zeit!\nFach:\`${aufgabe.subject}\`\nAbgabe-Platform:\`${aufgabe.platform}\n\`Deadline:\`${aufgabe.deadline}\``)
        message.react('⏰')
    });
    return cronJob;
}

export const generator = (): string => {
    return Array
        .from({ length: 10 }, () => Math.floor(Math.random() * 62))
        .map(v => v < 36
            ? v.toString(36)
            : (v - 26).toString(36).toUpperCase()
        )
        .join("");
}

export const sort = (array: any): void => {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < i; j++) {
            if (new Date(array[i].deadline) < new Date(array[j].deadline)) {
                let temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
    }
}
