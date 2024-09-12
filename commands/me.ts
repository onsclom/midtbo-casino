import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { data } from "../data";
import { marbleText } from "../plural";

export default {
  data: new SlashCommandBuilder()
    .setName("me")
    .setDescription("Check how many marbles you have"),
  async execute(interaction: ChatInputCommandInteraction) {
    const marbles = data.marbles[interaction.user.id] ?? 0;
    await interaction.reply({
      content: `You own ${marbleText(marbles)}.`,
      ephemeral: true,
    });
  },
};
