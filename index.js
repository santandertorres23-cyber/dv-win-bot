const { Client, GatewayIntentBits, ApplicationCommandOptionType } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
});

const wins = {}; // banco simples na memória

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

  await client.application.commands.create({
    name: "rank",
    description: "Ver ranking de vitórias",
  });

  console.log("Comandos registrados!");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "win") {
    const user = interaction.options.getUser("usuario");

    if (!wins[user.id]) {
      wins[user.id] = 0;
    }

    wins[user.id] += 1;

    await interaction.reply(`${user} agora tem ${wins[user.id]} vitória(s)! 🏆`);
  }

  if (interaction.commandName === "rank") {
    if (Object.keys(wins).length === 0) {
      return interaction.reply("Ninguém tem vitórias ainda.");
    }

    const ranking = Object.entries(wins)
      .sort((a, b) => b[1] - a[1])
      .map((user, index) => `${index + 1}º - <@${user[0]}>: ${user[1]} vitória(s)`)
      .join("\n");

    await interaction.reply(`🏆 **Ranking:**\n${ranking}`);
  }
});

client.login(process.env.TOKEN);
