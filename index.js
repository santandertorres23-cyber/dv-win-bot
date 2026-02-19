const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName('win')
    .setDescription('Marca uma vitória para um usuário')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuário que ganhou')
        .setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );
    console.log('Comando registrado.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'win') {
    const user = interaction.options.getUser('usuario');
    await interaction.reply(`${user} ganhou uma vitória! 🏆`);
  }
});

client.login(token);
