import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { data } from "../data";
import { replyWithEmbed } from "../discord-utils";

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Check the marbles in the server"),
  async execute(interaction: ChatInputCommandInteraction) {
    const marbles = data.marbles;
    const leaderboard = Object.entries(marbles);
    leaderboard.sort((a, b) => b[1] - a[1]);
    const leaderboardString = leaderboard.map(
      ([id, marbles]) => `<@${id}> **${marbles}**`,
    );

    await replyWithEmbed(
      interaction,
      "Marble Leaderboard",
      leaderboardString.join("\n"),
    );
  },
};
