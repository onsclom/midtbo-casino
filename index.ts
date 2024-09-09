import { Client, Events, GatewayIntentBits } from "discord.js";
import commands from "./commands";
const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const commmand = commands.find(
    (command) => command.data.name === interaction.commandName,
  );

  if (!commmand) {
    console.error(`Command not found: ${interaction.commandName}`);
    return;
  }

  // maybe wrap in try catch??
  commmand.execute(interaction);
});

client.login(token);
