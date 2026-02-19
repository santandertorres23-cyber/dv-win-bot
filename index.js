const {
  Client,
  GatewayIntentBits,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

/* ================= DADOS ================= */

let data = {
  total: {},
  season: {},
  seasonMonth: ""
};

if (fs.existsSync("./wins.json")) {
  data = JSON.parse(fs.readFileSync("./wins.json"));
}

function salvar() {
  fs.writeFileSync("./wins.json", JSON.stringify(data, null, 2));
}

function verificarTemporada() {
  const now = new Date();
  const mes = `${now.getFullYear()}-${now.getMonth() + 1}`;
  if (data.seasonMonth !== mes) {
    data.season = {};
    data.seasonMonth = mes;
    salvar();
  }
}

/* ================= CARGOS ================= */

const RANK_CONFIG = [
  { name: "Try hard", wins: 50, color: 0xff0000 },
  { name: "rare talent", wins: 30, color: 0xff8800 },
  { name: "iluminado", wins: 20, color: 0xffff00 },
  { name: "muita bala", wins: 15, color: 0x00ff00 },
  { name: "01 da sensi", wins: 10, color: 0x0099ff },
  { name: "magnata", wins: 5, color: 0x9900ff }
];

const TOP1_ROLE = {
  name: "Top 1 Mensal",
  color: 0xffffff
};

async function criarCargos(guild) {

  for (let i = 0; i < RANK_CONFIG.length; i++) {

    const rank = RANK_CONFIG[i];
    let role = guild.roles.cache.find(r => r.name === rank.name);

    if (!role) {
      role = await guild.roles.create({
        name: rank.name,
        color: rank.color
      });
    } else {
      await role.setColor(rank.color);
    }

    rank.id = role.id;
    await role.setPosition(guild.roles.highest.position - (i + 1));
  }

  let topRole = guild.roles.cache.find(r => r.name === TOP1_ROLE.name);

  if (!topRole) {
    topRole = await guild.roles.create({
      name: TOP1_ROLE.name,
      color: TOP1_ROLE.color
    });
  }

  TOP1_ROLE.id = topRole.id;
}

async function atualizarCargo(member, wins) {
  for (const rank of RANK_CONFIG) {
    if (member.roles.cache.has(rank.id))
      await member.roles.remove(rank.id).catch(() => {});
  }

  for (const rank of RANK_CONFIG) {
    if (wins >= rank.wins) {
      await member.roles.add(rank.id).catch(() => {});
      break;
    }
  }
}

async function atualizarTop1(guild) {
  if (!Object.keys(data.season).length) return;

  const top = Object.entries(data.season)
    .sort((a, b) => b[1] - a[1])[0];

  const role = guild.roles.cache.get(TOP1_ROLE.id);
  if (!role) return;

  for (const member of role.members.values())
    await member.roles.remove(role).catch(() => {});

  const member = await guild.members.fetch(top[0]).catch(() => null);
  if (member)
    await member.roles.add(role).catch(() => {});
}

async function addWin(userId, guild) {
  if (!data.total[userId]) data.total[userId] = 0;
  if (!data.season[userId]) data.season[userId] = 0;

  data.total[userId]++;
  data.season[userId]++;

  salvar();

  const member = await guild.members.fetch(userId).catch(() => null);
  if (member)
    await atualizarCargo(member, data.total[userId]);

  await atualizarTop1(guild);
}

/* ================= DUELOS ================= */

const duelos = {};

/* ================= READY ================= */

client.once("ready", async () => {

  const guild = client.guilds.cache.first();
  await criarCargos(guild);

  await client.application.commands.set([
    { name: "painel", description: "Abrir painel Casa do DV" }
  ]);

  console.log("Sistema iniciado.");
});

/* ================= INTERAÇÕES ================= */

client.on("interactionCreate", async interaction => {

  verificarTemporada();

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "painel") {

      const embed = new EmbedBuilder()
        .setColor("#111111")
        .setImage("COLOQUE_AQUI_O_LINK_DA_IMAGEM")
        .setTitle("CASA DO DV - Sistema Competitivo")
        .setDescription("Escolha uma opção abaixo:");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("abrir_duelo")
          .setLabel("Duelo")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("abrir_rank")
          .setLabel("Ranking")
          .setStyle(ButtonStyle.Secondary)
      );

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  /* ================= BOTÕES ================= */

  if (interaction.isButton()) {

    if (interaction.customId === "abrir_rank") {

      const ranking = Object.entries(data.total)
        .sort((a, b) => b[1] - a[1])
        .map((u, i) => `${i + 1}º - <@${u[0]}>: ${u[1]} wins`)
        .join("\n") || "Sem dados.";

      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("Ranking Geral")
        .setDescription(ranking);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId === "abrir_duelo") {

      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("menu_duelo")
          .setPlaceholder("Escolha o tipo de duelo")
          .addOptions([
            { label: "1v1", value: "1" },
            { label: "2v2", value: "2" },
            { label: "4v4", value: "4" }
          ])
      );

      return interaction.reply({
        content: "Selecione o modo:",
        components: [menu],
        ephemeral: true
      });
    }
  }

  /* ================= SELECT MENU ================= */

  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "menu_duelo") {

      const tipo = interaction.values[0];

      duelos[interaction.user.id] = {
        tipo: parseInt(tipo)
      };

      return interaction.reply({
        content: `Modo ${tipo}v${tipo} selecionado.\nUse o comando /duelo normalmente para iniciar.`,
        ephemeral: true
      });
    }
  }
});


client.login(process.env.TOKEN);
