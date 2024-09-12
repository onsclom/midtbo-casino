import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { addMarbles, data, subtractMarbles } from "../data";
import { marbleText } from "../plural";
import { replyWithEmbed } from "../discord-utils";

export default {
  data: new SlashCommandBuilder()
    .setName("multi-flip")
    .setDescription("Gamble multiple coinflips (1 marble per flip)")
    .addIntegerOption((option) =>
      option
        .setName("flips")
        .setDescription("Amount of coinflips (1 marble each)")
        .setMinValue(1)
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const flips = interaction.options.getInteger("flips", true);

    const existingGame = data.multiFlips[flips];
    if (existingGame) {
      const initiator = existingGame.initiator;
      if (initiator === interaction.user.id) {
        addMarbles(interaction.user.id, flips);
        delete data.multiFlips[flips];
        await interaction.reply(
          `<@${interaction.user.id}> canceled their ${flips} multi-flip offer.`,
        );
        return;
      }
      // play the game
      // check they have enough
      const playerMarbles = data.marbles[interaction.user.id] ?? 0;
      if (playerMarbles < flips) {
        await interaction.reply({
          content: `You need ${marbleText(flips)} but only have ${playerMarbles}!`,
          ephemeral: true,
        });
        return;
      }
      subtractMarbles(interaction.user.id, flips);
      const results = Array.from({ length: flips }, () =>
        Math.random() < 0.5 ? initiator : interaction.user.id,
      );
      const initiatorWins = results.filter((id) => id === initiator).length;
      const playerWins = flips - initiatorWins;
      addMarbles(initiator, flips - playerWins + initiatorWins);
      addMarbles(interaction.user.id, flips - initiatorWins + playerWins);
      delete data.multiFlips[flips];
      const winnerScore = Math.max(initiatorWins, playerWins);
      const loserScore = Math.min(initiatorWins, playerWins);
      const netScore = winnerScore - loserScore;
      const winner =
        initiatorWins > playerWins ? initiator : interaction.user.id;
      const loser =
        initiatorWins > playerWins ? interaction.user.id : initiator;
      const initiatorEmoji =
        initiatorWins === playerWins
          ? `😑`
          : initiator === winner
            ? `😎`
            : `😢`;
      const playerEmoji =
        initiatorWins === playerWins
          ? `😑`
          : interaction.user.id === winner
            ? `😎`
            : `😢`;
      const resultText =
        initiatorWins === playerWins
          ? "**It's a tie!**"
          : `<@${loser}> gives <@${winner}> **${marbleText(netScore)}**!`;
      await interaction.reply(
        `<@${initiator}> won **${initiatorWins}/${flips}** (${Math.round((initiatorWins / flips) * 100)}%) ${initiatorEmoji}
<@${interaction.user.id}> won **${playerWins}/${flips}** (${Math.round((playerWins / flips) * 100)}%) ${playerEmoji}

${resultText}`,
      );
      return;
    }

    // check if enough
    const playerMarbles = data.marbles[interaction.user.id] ?? 0;
    if (playerMarbles < flips) {
      await interaction.reply({
        content: `You need ${marbleText(flips)} but only have ${playerMarbles}!`,
        ephemeral: true,
      });
      return;
    }
    subtractMarbles(interaction.user.id, flips);
    data.multiFlips[flips] = { initiator: interaction.user.id };
    await replyWithEmbed(
      interaction,
      "Multi-Flip Offer",
      `<@${interaction.user.id}> offered a ${flips} multi-flip! Accept with **/multi-flip ${flips}**.`,
    );
  },
};
