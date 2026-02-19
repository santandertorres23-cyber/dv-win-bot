const { Client, GatewayIntentBits, ApplicationCommandOptionType } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
});

client.once("ready", async () => {
  console.log(`Logado como ${client.user.tag}`);

  await client.application.commands.create({
    name: "win",
    description: "Dar uma vitória para alguém",
    options: [
      {
        name: "usuario",
        description: "Selecione o usuário",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  });

  console.log("Comando /win registrado!");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "win") {
    const user = interaction.options.getUser("usuario");
    await interaction.reply(`${user} ganhou uma vitória! 🏆`);
  }
});

client.login(process.env.TOKEN);
