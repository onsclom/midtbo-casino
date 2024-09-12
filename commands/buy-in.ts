import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { addMarbles, data } from "../data";
import { venmoBuyInLink } from "../venmo";
import { marbleText } from "../plural";

export default {
  data: new SlashCommandBuilder()
    .setName("buy-in")
    .setDescription("Pay $ for marbles")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of $ to buy in")
        .setMinValue(1)
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger("amount", true);
    addMarbles(interaction.user.id, amount);
    await interaction.reply({
      content: `Venmo austin @ ${venmoBuyInLink(amount)}`,
      ephemeral: true,
    });
    await interaction.followUp({
      content: `<@${interaction.user.id}> paid $${amount} for ${marbleText(amount)}`,
    });
  },
};
