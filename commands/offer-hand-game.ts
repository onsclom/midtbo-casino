import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { data, subtractMarbles } from "../data";

export default {
  data: new SlashCommandBuilder()
    .setName("offer-hand-game")
    .setDescription("Make a hand game for 1 marble")
    .addStringOption((option) =>
      option
        .setName("hand")
        .setDescription("Hand to hide the marble in")
        .setRequired(true)
        .addChoices([
          { name: "left", value: "left" },
          { name: "right", value: "right" },
        ]),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const hand = interaction.options.getString("hand", true) as
      | "left"
      | "right";
    if (data.currentHandGame) {
      await interaction.reply(
        "There is already a hand game in progress! Accept with **/accept-hand-game**.",
      );
      return;
    }
    const userMarbles = data.marbles[interaction.user.id] ?? 0;
    if (userMarbles < 1) {
      await interaction.reply({
        content: "You need at least 1 marble to make a hand game!",
        ephemeral: true,
      });
      return;
    }
    subtractMarbles(interaction.user.id, 1);
    data.currentHandGame = { initiator: interaction.user.id, hand };
    await interaction.reply(
      `<@${interaction.user.id}> has made a hand game for $1! Accept with **/accept-hand-game**.`,
    );
  },
};
