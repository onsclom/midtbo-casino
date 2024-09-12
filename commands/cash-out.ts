import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { data, subtractMarbles } from "../data";
import { venmoBuyInLink } from "../venmo";
import { marbleText } from "../plural";

export default {
  data: new SlashCommandBuilder()
    .setName("cash-out")
    .setDescription("Cash out marbles for $")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of marbles to cashout")
        .setMinValue(1)
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger("amount", true);
    const existingMarbles = data.marbles[interaction.user.id] ?? 0;
    if (existingMarbles < amount) {
      await interaction.reply({
        content: `You tried to cashout ${amount}, but you only have ${marbleText(amount)}!`,
        ephemeral: true,
      });
      return;
    }
    subtractMarbles(interaction.user.id, amount);
    await interaction.reply({
      content: `Request payment from austin @ ${venmoBuyInLink(amount)}`,
      ephemeral: true,
    });
    await interaction.followUp({
      content: `<@${interaction.user.id}> cashed out ${marbleText(amount)} for $${amount}`,
    });
  },
};
