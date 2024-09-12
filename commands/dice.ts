import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { addMarbles, data, subtractMarbles } from "../data";
import { marbleText } from "../plural";

export default {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Loser pays winner for each point difference")
    .addIntegerOption((option) =>
      option
        .setName("sides")
        .setDescription("Amount of sides on each dice")
        .setMinValue(1)
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const sides = interaction.options.getInteger("sides", true);
    const existingGame = data.dice[sides];
    if (existingGame) {
      const initiator = existingGame.initiator;
      if (initiator === interaction.user.id) {
        addMarbles(interaction.user.id, sides);
        delete data.dice[sides];
        await interaction.reply(
          `<@${interaction.user.id}> canceled their ${sides}-sided dice game!`,
        );
        return;
      }

      const playerMarbles = data.marbles[interaction.user.id] ?? 0;
      if (playerMarbles < sides) {
        await interaction.reply({
          content: `You need at least ${sides} marbles to play a ${sides}-sided dice game!`,
          ephemeral: true,
        });
        return;
      }

      subtractMarbles(interaction.user.id, sides);
      const initiatorRoll = Math.floor(Math.random() * sides) + 1;
      const playerRoll = Math.floor(Math.random() * sides) + 1;
      const difference = Math.abs(initiatorRoll - playerRoll);
      addMarbles(
        initiator,
        initiatorRoll > playerRoll ? sides + difference : sides - difference,
      );
      addMarbles(
        interaction.user.id,
        playerRoll > initiatorRoll ? sides + difference : sides - difference,
      );
      delete data.dice[sides];

      const winner =
        initiatorRoll > playerRoll ? initiator : interaction.user.id;
      const loser = winner === initiator ? interaction.user.id : initiator;
      const result =
        difference === 0
          ? `It's a **tie**! Both players get their marbles back.`
          : `<@${loser}> gives <@${winner}> **${marbleText(difference)}**!`;

      await interaction.reply(`Both players roll a ${sides}-sided dice!

<@${interaction.user.id}> rolled a **${playerRoll}**!
<@${initiator}> rolled a **${initiatorRoll}**!

${result}`);
      return;
    }

    const playerMarbles = data.marbles[interaction.user.id] ?? 0;
    if (playerMarbles < sides) {
      await interaction.reply({
        content: `You need at least ${sides} marbles to play a ${sides}-sided dice game!`,
        ephemeral: true,
      });
      return;
    }
    subtractMarbles(interaction.user.id, sides);
    data.dice[sides] = { initiator: interaction.user.id };
    await interaction.reply(
      `<@${interaction.user.id}> started a ${sides}-sided dice game! Accept with **/dice ${sides}**.`,
    );
  },
};
