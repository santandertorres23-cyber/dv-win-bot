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
        description: "Quem você quer desafiar?",
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

  // COMANDO
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "duelo") {

      const alvo = interaction.options.getUser("usuario");

      if (alvo.id === interaction.user.id) {
        return interaction.reply("Você não pode duelar contra si mesmo.");
      }

      duelos[interaction.id] = {
        desafiante: interaction.user.id,
        desafiado: alvo.id,
        aceito: false
      };

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`aceitar_${interaction.id}`)
          .setLabel("Aceitar Duelo")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        content: `${alvo}, você aceita o duelo contra ${interaction.user}?`,
        components: [row]
      });
    }

    if (interaction.commandName === "rank") {
      if (Object.keys(wins).length === 0) {
        return interaction.reply("Ninguém tem vitórias ainda.");
      }

      const ranking = Object.entries(wins)
        .sort((a, b) => b[1] - a[1])
        .map((u, i) => `${i + 1}º - <@${u[0]}>: ${u[1]} vitória(s)`)
        .join("\n");

      await interaction.reply(`🏆 Ranking:\n${ranking}`);
    }
  }

  // BOTÕES
  if (interaction.isButton()) {

    const [acao, id] = interaction.customId.split("_");
    const duelo = duelos[id];

    if (!duelo) {
      return interaction.reply({ content: "Duelo não encontrado.", ephemeral: true });
    }

    // ACEITAR DUELO
    if (acao === "aceitar") {

      if (interaction.user.id !== duelo.desafiado) {
        return interaction.reply({ content: "Só o desafiado pode aceitar.", ephemeral: true });
      }

      duelo.aceito = true;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`confirmar_${id}`)
          .setLabel("Confirmar Vitória")
          .setStyle(ButtonStyle.Success)
      );

      return interaction.update({
        content: `Duelo aceito! Após a partida, confirme o vencedor.`,
        components: [row]
      });
    }

    // CONFIRMAR VITÓRIA
    if (acao === "confirmar") {

      if (!duelo.aceito) {
        return interaction.reply({ content: "O duelo ainda não foi aceito.", ephemeral: true });
      }

      if (interaction.user.id !== duelo.desafiado) {
        return interaction.reply({ content: "Só o perdedor pode confirmar a vitória.", ephemeral: true });
      }

      if (!wins[duelo.desafiante]) {
        wins[duelo.desafiante] = 0;
      }

      wins[duelo.desafiante] += 1;

      delete duelos[id];

      return interaction.update({
        content: `🏆 <@${duelo.desafiante}> ganhou a vitória confirmada!`,
        components: []
      });
    }
  }
});

client.login(process.env.TOKEN);
