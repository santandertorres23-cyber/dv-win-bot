const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const express = require("express");

// ===== EXPRESS (OBRIGATÓRIO PARA RAILWAY) =====
const app = express();

app.get("/", (req, res) => {
  res.send("Bot online");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Servidor web ativo na porta " + PORT);
});

// ===== DISCORD CLIENT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== BANCO SIMPLES EM MEMÓRIA =====
const duelos = {};
const wins = {};

// ===== BOT ONLINE =====
client.once("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

// ===== COMANDO PAINEL =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!painel") {

    const embed = new EmbedBuilder()
      .setTitle("⚔️ Sistema de Duelo")
      .setDescription("Clique para iniciar um duelo!")
      .setImage("COLE_AQUI_O_LINK_DO_SEU_BANNER")
      .setColor("Red");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("iniciar_duelo")
        .setLabel("Iniciar Duelo")
        .setStyle(ButtonStyle.Danger)
    );

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

// ===== BOTÕES =====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // INICIAR DUELO
  if (interaction.customId === "iniciar_duelo") {

    duelos[interaction.user.id] = true;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("vitoria")
        .setLabel("Confirmar Vitória")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
      content: "Duelo iniciado! Clique abaixo quando vencer.",
      components: [row]
    });
  }

  // CONFIRMAR VITÓRIA
  if (interaction.customId === "vitoria") {

    if (!duelos[interaction.user.id]) {
      return interaction.reply({
        content: "Você não iniciou um duelo!",
        ephemeral: true
      });
    }

    if (!wins[interaction.user.id]) {
      wins[interaction.user.id] = 0;
    }

    wins[interaction.user.id] += 1;

    delete duelos[interaction.user.id];

    await interaction.reply({
      content: `🏆 Vitória confirmada!\nTotal de wins: ${wins[interaction.user.id]}`
    });
  }
});

client.login(process.env.TOKEN);
