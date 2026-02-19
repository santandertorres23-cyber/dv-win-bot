const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;

const BANNER_URL = "COLE_AQUI_O_LINK_DA_IMAGEM";

if (!fs.existsSync("./wins.json")) {
  fs.writeFileSync("./wins.json", JSON.stringify({}));
}

let duelos = {};

const cargosWins = [
  { wins: 5, nome: "magnata", cor: 0xFFD700 },
  { wins: 10, nome: "01 da sensi", cor: 0x00FFFF },
  { wins: 15, nome: "muita bala", cor: 0xFF0000 },
  { wins: 20, nome: "iluminado", cor: 0xFFFFFF },
  { wins: 30, nome: "rare talent", cor: 0x800080 },
  { wins: 50, nome: "try hard", cor: 0xFF4500 }
];

client.once("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!painel") {

    const embed = new EmbedBuilder()
      .setTitle("CASA DO DV - PAINEL DE DUELO")
      .setDescription("Escolha o modo do duelo abaixo")
      .setImage(BANNER_URL)
      .setColor("Red");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("1v1")
        .setLabel("1v1")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("2v2")
        .setLabel("2v2")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("4v4")
        .setLabel("4v4")
        .setStyle(ButtonStyle.Danger)
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const modo = interaction.customId;

  duelos[interaction.user.id] = {
    modo,
    tempo: Date.now()
  };

  await interaction.reply({
    content: `Duelo ${modo} iniciado! Você tem 2 minutos para confirmar.`,
    ephemeral: true
  });
});

client.on("messageCreate", async (message) => {
  if (message.content === "!confirmar") {

    const duelo = duelos[message.author.id];

    if (!duelo)
      return message.reply("Você não tem duelo pendente.");

    if (Date.now() - duelo.tempo > 120000) {
      delete duelos[message.author.id];
      return message.reply("Tempo expirado.");
    }

    let data = JSON.parse(fs.readFileSync("./wins.json"));

    if (!data[message.author.id]) {
      data[message.author.id] = {
        wins: 0,
        mes: new Date().getMonth()
      };
    }

    if (data[message.author.id].mes !== new Date().getMonth()) {
      data[message.author.id].wins = 0;
      data[message.author.id].mes = new Date().getMonth();
    }

    data[message.author.id].wins += 1;
    fs.writeFileSync("./wins.json", JSON.stringify(data, null, 2));

    const wins = data[message.author.id].wins;

    const member = await message.guild.members.fetch(message.author.id);

    for (const cargo of cargosWins) {
      if (wins >= cargo.wins) {

        let role = message.guild.roles.cache.find(r => r.name === cargo.nome);

        if (!role) {
          role = await message.guild.roles.create({
            name: cargo.nome,
            color: cargo.cor
          });
        }

        if (!member.roles.cache.has(role.id)) {
          await member.roles.add(role);
        }
      }
    }

    delete duelos[message.author.id];

    message.reply(`Vitória confirmada! Agora você tem ${wins} wins.`);
  }
});

setInterval(() => {}, 1000);

client.login(TOKEN);
