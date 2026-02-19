const { EmbedBuilder, Events } = require('discord.js');

module.exports = (client) => {

    const LOG_CHANNEL_ID = "ID_DO_CANAL_DE_LOG";

    function sendLog(guild, embed) {
        const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!channel) return;
        channel.send({ embeds: [embed] });
    }

    // 📥 Entrada
    client.on(Events.GuildMemberAdd, member => {
        const embed = new EmbedBuilder()
            .setTitle('📥 Membro entrou')
            .setColor('Green')
            .addFields(
                { name: 'Usuário', value: `${member.user.tag}` },
                { name: 'ID', value: member.id },
                { name: 'Conta criada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
            )
            .setTimestamp();

        sendLog(member.guild, embed);
    });

    // 📤 Saída
    client.on(Events.GuildMemberRemove, member => {
        const embed = new EmbedBuilder()
            .setTitle('📤 Membro saiu')
            .setColor('Orange')
            .addFields(
                { name: 'Usuário', value: `${member.user.tag}` },
                { name: 'ID', value: member.id }
            )
            .setTimestamp();

        sendLog(member.guild, embed);
    });

    // 🗑️ Mensagem apagada
    client.on(Events.MessageDelete, message => {
        if (!message.guild || message.author?.bot) return;

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Mensagem apagada')
            .setColor('Red')
            .addFields(
                { name: 'Usuário', value: `${message.author.tag}` },
                { name: 'Canal', value: `${message.channel}` },
                { name: 'Conteúdo', value: message.content || 'Sem texto' }
            )
            .setTimestamp();

        sendLog(message.guild, embed);
    });

    // 🔨 Ban
    client.on(Events.GuildBanAdd, ban => {
        const embed = new EmbedBuilder()
            .setTitle('🔨 Usuário banido')
            .setColor('DarkRed')
            .addFields(
                { name: 'Usuário', value: `${ban.user.tag}` },
                { name: 'ID', value: ban.user.id }
            )
            .setTimestamp();

        sendLog(ban.guild, embed);
    });

};
