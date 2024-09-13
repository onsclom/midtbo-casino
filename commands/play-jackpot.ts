import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { addMarbles, data, subtractMarbles } from "../data";
import { marbleText, pluralize } from "../plural";
import { replyWithEmbed } from "../discord-utils";

export default {
  data: new SlashCommandBuilder()
    .setName("play-jackpot")
    .setDescription("Pay $1 for a chance to win the jackpot"),
  async execute(interaction: ChatInputCommandInteraction) {
    const userMarbles = data.marbles[interaction.user.id] ?? 0;
    if (userMarbles < 1) {
      await interaction.reply({
        content: "You tried to play the jackpot but you don't have 1 marble!",
        ephemeral: true,
      });
      return;
    }
    const jackpot = data.jackpot;
    if (!jackpot) {
      await interaction.reply({
        content: "There is no jackpot. Use **/create-jackpot** to create one!",
        ephemeral: true,
      });
      return;
    }

    if (jackpot.initiator === interaction.user.id) {
      await interaction.reply({
        content: "You can't play your own jackpot!",
        ephemeral: true,
      });
      return;
    }

    subtractMarbles(interaction.user.id, 1);
    addMarbles(jackpot.initiator, 1);
    jackpot.attempts++;
    const winProbability = 1 / jackpot.size;
    const won = Math.random() < winProbability;

    if (won) {
      const jackpotSize = jackpot.size;
      const attempts = jackpot.attempts;
      const initiatorNet = attempts - jackpotSize;
      addMarbles(interaction.user.id, jackpotSize);
      data.jackpot = null;

      await replyWithEmbed(
        interaction,
        `Jackpot Win 🎉`,
        `<@${interaction.user.id}> won the jackpot of **${jackpotSize}**!

This jackpot was played **${pluralize("time", attempts)}**. <@${jackpot.initiator}> netted **${marbleText(initiatorNet)}**!

Use **/create-jackpot <amount>** to create a new jackpot!`,
      );
      return;
    }

    const percentage = Math.round(winProbability * 100);
    await replyWithEmbed(
      interaction,
      "Jackpot Attempt",
      `<@${interaction.user.id}> gave **1 marble** to <@${jackpot.initiator}>.

Use **/play-jackpot** to pay **1 marble** for a **${percentage}% chance** to win **${marbleText(
        jackpot.size,
      )}**!`,
    );
  },
};
