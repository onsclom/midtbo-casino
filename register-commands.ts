import { REST, Routes } from "discord.js";
import commands from "./commands";

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
if (!TOKEN) throw new Error("DISCORD_TOKEN is required.");
if (!CLIENT_ID) throw new Error("DISCORD_CLIENT_ID is required.");
if (!GUILD_ID) throw new Error("DISCORD_GUILD_ID is required.");

const commandData = commands.map((command) => command.data);
const rest = new REST({ version: "10" }).setToken(TOKEN);
try {
  console.log("Started refreshing application (/) commands.");
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: commandData,
  });
  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}
