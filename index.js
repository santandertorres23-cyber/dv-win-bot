const { 
  Client, 
  GatewayIntentBits, 
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
});

const wins = {};
const duelos = {};

client.once("ready", async () => {
  console.log(`Logado como ${client.user.tag}`);

  await client.application.commands.create({
    name: "duelo",
    description: "Desafiar alguém",
    options: [
      {
        name: "usuario",
        description: "Quem perdeu?",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  });

  await client.application.commands.create({
    name: "rank",
    description: "Ver ranking",
  });

  console.log("Comandos registrados!");
});

client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "duelo") {
      const alvo = interaction.options.getUser("usuario");

      if (alvo.id === interaction.user.id) {
        return interaction.reply("Você não pode duelar contra si mesmo.");
      }

      duelos[alvo.id] = interaction.user.id;

      const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirmar")
          .setLabel("Confirmar derrota")
          .setStyle(ButtonStyle.Success)
      );

      await interaction.reply({
        content: `${alvo}, você confirma que perdeu para ${interaction.user}?`,
        components: [botao]
      });
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
  }

  if (interaction.isButton()) {
  if (interaction.customId === "confirmar") {

    const vencedorId = duelos[interaction.user.id];

    // 🔒 Verifica se existe duelo pendente
    if (!vencedorId) {
      return interaction.reply({ 
        content: "Você não tem nenhum duelo pendente.", 
        ephemeral: true 
      });
    }

    // 🔒 Só o usuário marcado pode confirmar
    if (!duelos[interaction.user.id]) {
      return interaction.reply({ 
        content: "Você não pode confirmar esse duelo.", 
        ephemeral: true 
      });
    }

    if (!wins[vencedorId]) {
      wins[vencedorId] = 0;
    }

    wins[vencedorId] += 1;

    delete duelos[interaction.user.id];

    await interaction.update({
      content: `🏆 <@${vencedorId}> ganhou a vitória confirmada!`,
      components: []
    });
  }
}
    if (interaction.customId === "confirmar") {

      const vencedorId = duelos[interaction.user.id];

      if (!vencedorId) {
        return interaction.reply({ content: "Nenhum duelo pendente.", ephemeral: true });
      }

      if (!wins[vencedorId]) {
        wins[vencedorId] = 0;
      }

      wins[vencedorId] += 1;
      delete duelos[interaction.user.id];

      await interaction.update({
        content: `🏆 <@${vencedorId}> ganhou a vitória!`,
        components: []
      });
    }
  }
});

client.login(process.env.TOKEN);
