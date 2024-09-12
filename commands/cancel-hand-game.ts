import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { addMarbles, data } from "../data";

export default {
  data: new SlashCommandBuilder()
    .setName("cancel-hand-game")
    .setDescription("Cancel a hand offer you made"),
  async execute(interaction: ChatInputCommandInteraction) {
    const game = data.currentHandGame;
    if (game && game.initiator === interaction.user.id) {
      addMarbles(interaction.user.id, 1);
      data.currentHandGame = null;
      await interaction.reply(
        `<@${interaction.user.id}> canceled the hand game!`,
      );
      return;
    }
    await interaction.reply({
      content: "You don't have a hand game in progress to cancel!",
      ephemeral: true,
    });
  },
};
