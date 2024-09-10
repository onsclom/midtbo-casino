import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import commands from "./commands";
import { setupData } from "./data";

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
if (!TOKEN) throw new Error("DISCORD_TOKEN is required.");
if (!CLIENT_ID) throw new Error("DISCORD_CLIENT_ID is required.");
if (!GUILD_ID) throw new Error("DISCORD_GUILD_ID is required.");

{
  // register commands
  const commandData = commands.map((command) => command.data);
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  console.log("Started refreshing application (/) commands.");
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: commandData,
  });
  console.log("Successfully reloaded application (/) commands.");
}
await setupData();

{
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
    try {
      commmand.execute(interaction);
    } catch (e) {
      if (e instanceof Error) {
        interaction.reply(
          `There was an error trying to execute **${interaction.commandName}**:
  \`\`\`
  ${e.stack}
  \`\`\``,
        );
      }
    }
  });
  client.login(TOKEN);
}
