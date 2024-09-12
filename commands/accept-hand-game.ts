import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { addMarbles, data, subtractMarbles } from "../data";

export default {
  data: new SlashCommandBuilder()
    .setName("accept-hand-game")
    .setDescription("Accept a hand game for 1 marble")
    .addStringOption((option) =>
      option
        .setName("hand")
        .setDescription("Hand to guess the marble is in")
        .setRequired(true)
        .addChoices([
          { name: "left", value: "left" },
          { name: "right", value: "right" },
        ]),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const chosenHand = interaction.options.getString("hand", true);
    const game = data.currentHandGame;
    if (!game) {
      await interaction.reply({
        content:
          "There is no hand game in progress! Offer one with **/offer-hand-game**.",
        ephemeral: true,
      });
      return;
    }
    const playerMarbles = data.marbles[interaction.user.id] ?? 0;
    if (playerMarbles < 1) {
      await interaction.reply({
        content: "You need at least 1 marble to accept a hand game!",
        ephemeral: true,
      });
      return;
    }
    subtractMarbles(interaction.user.id, 1);
    const winner =
      game.hand === chosenHand ? interaction.user.id : game.initiator;
    addMarbles(winner, 1);
    data.currentHandGame = null;
    const loser =
      winner === interaction.user.id ? game.initiator : interaction.user.id;
    await interaction.reply(
      `<@${interaction.user.id}> guessed **${chosenHand}** and was **${
        game.hand === chosenHand ? "correct" : "incorrect"
      }**! <@${winner}> won a marble from <@${loser}>!`,
    );
  },
};
