import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { data, subtractMarbles } from "../data";
import { marbleText } from "../plural";
import { replyWithEmbed } from "../discord-utils";

export default {
  data: new SlashCommandBuilder()
    .setName("create-jackpot")
    .setDescription("Invest in a jackpot that other users can play for")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription(
          "Amount jackpot is worth. This also decides the probability of hitting.",
        )
        .setMinValue(1)
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger("amount", true);
    const userMarbles = data.marbles[interaction.user.id] ?? 0;
    if (userMarbles < amount) {
      await interaction.reply({
        content: `You tried to create a jackpot worth ${amount}, but you only have ${userMarbles}!`,
        ephemeral: true,
      });
      return;
    }

    if (data.jackpot) {
      await interaction.reply({
        content: `There is already a jackpot in play! Play with **/play-jackpot**`,
        ephemeral: true,
      });
      return;
    }

    subtractMarbles(interaction.user.id, amount);
    data.jackpot = {
      initiator: interaction.user.id,
      size: amount,
      attempts: 0,
    };
    const probability = Math.round((1 / amount) * 100);
    await replyWithEmbed(
      interaction,
      `Jackpot Created`,
      `<@${interaction.user.id}> created a jackpot worth **${amount} marbles**!

Use **/play-jackpot** to pay **1 marble** for a **${probability}% chance** to win **${marbleText(
        data.jackpot.size,
      )}**!`,
    );
  },
};
