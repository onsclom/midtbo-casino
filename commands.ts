import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { data } from "./data";

export default [
  {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!"),
    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.reply("Pong!");
    },
  },
  {
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
      const link = generateVenmoLink(
        amount,
        `Buying ${amount} ${pluralize("marble", amount)}`,
        "main17893",
        "pay",
      );
      const existingMarbles = data.marbles[interaction.user.id] ?? 0;
      data.marbles[interaction.user.id] = existingMarbles + amount;
      await interaction.reply({
        content: `Venmo austin @ ${link}`,
        ephemeral: true,
      });
      await interaction.followUp({
        content: `<@${interaction.user.id}> paid $${amount} for ${amount} ${pluralize(
          "marble",
          amount,
        )}`,
      });
    },
  },
  {
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
          content: `You tried to cashout ${amount}, but you only have ${existingMarbles} ${pluralize(
            "marble",
            existingMarbles,
          )}!`,
          ephemeral: true,
        });
        return;
      }
      data.marbles[interaction.user.id] = existingMarbles - amount;
      const link = generateVenmoLink(
        amount,
        `Cashing out ${amount} ${pluralize("marble", amount)}`,
        "main17893",
        "charge",
      );
      await interaction.reply({
        content: `Request payment from austin @ ${link}`,
        ephemeral: true,
      });
      await interaction.followUp({
        content: `<@${interaction.user.id}> cashed out ${amount} ${pluralize(
          "marble",
          amount,
        )} for $${amount}`,
      });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("me")
      .setDescription("Check how many marbles you have"),
    async execute(interaction: ChatInputCommandInteraction) {
      const marbles = data.marbles[interaction.user.id] ?? 0;
      await interaction.reply({
        content: `You have ${marbles} ${pluralize("marble", marbles)}.`,
        ephemeral: true,
      });
    },
  },

  // hand game
  {
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
          "There is already a hand game in progress! Use **/accept-hand-game** to play.",
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
      data.marbles[interaction.user.id] = userMarbles - 1;
      data.currentHandGame = { initiator: interaction.user.id, hand };
      await interaction.reply(
        `<@${interaction.user.id}> has made a hand game for $1! Use **/accept-hand-game** to play.`,
      );
    },
  },
  {
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
      if (game) {
        const playerMarbles = data.marbles[interaction.user.id] ?? 0;
        if (playerMarbles < 1) {
          await interaction.reply({
            content: "You need at least 1 marble to accept a hand game!",
            ephemeral: true,
          });
          return;
        }
        data.marbles[interaction.user.id] = playerMarbles - 1;
        const winner =
          game.hand === chosenHand ? interaction.user.id : game.initiator;
        data.marbles[winner] = (data.marbles[winner] ?? 0) + 2;
        data.currentHandGame = null;
        const loser =
          winner === interaction.user.id ? game.initiator : interaction.user.id;
        await interaction.reply(
          `<@${interaction.user.id}> guessed **${chosenHand}** and was **${
            game.hand === chosenHand ? "correct" : "incorrect"
          }**! <@${winner}> won a marble from <@${loser}>!`,
        );
      } else {
        await interaction.reply({
          content:
            "There is no hand game in progress! Make one with **/offer-hand-game**.",
          ephemeral: true,
        });
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("cancel-hand-game")
      .setDescription("Cancel a hand offer you made"),
    async execute(interaction: ChatInputCommandInteraction) {
      const game = data.currentHandGame;
      if (game && game.initiator === interaction.user.id) {
        data.marbles[interaction.user.id] =
          (data.marbles[interaction.user.id] ?? 0) + 1;
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
  },

  // // dice
  // {
  //   data: new SlashCommandBuilder()
  //     .setName("dice")
  //     .setDescription("Loser pays winner for each point difference")
  //     .addIntegerOption((option) =>
  //       option
  //         .setName("sides")
  //         .setDescription("Amount of coinflips (1 marble each)")
  //         .setMinValue(1)
  //         .setRequired(true),
  //     ),
  //   async execute(interaction: ChatInputCommandInteraction) {},
  // },

  // multi-flip
  {
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
          // cancel the game
          data.marbles[interaction.user.id] =
            (data.marbles[interaction.user.id] ?? 0) + flips;
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
            content: `You need ${flips} ${pluralize("marble", flips)} but only have ${playerMarbles}!`,
            ephemeral: true,
          });
          return;
        }
        data.marbles[interaction.user.id] -= flips;
        const results = Array.from({ length: flips }, () =>
          Math.random() < 0.5 ? initiator : interaction.user.id,
        );
        const initiatorWins = results.filter((id) => id === initiator).length;
        const playerWins = flips - initiatorWins;
        data.marbles[initiator] += flips - playerWins + initiatorWins;
        data.marbles[interaction.user.id] += flips - initiatorWins + playerWins;
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
            : `<@${loser}> gives <@${winner}> **${netScore} ${pluralize(
                "marble",
                netScore,
              )}**!`;
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
          content: `You need ${flips} ${pluralize("marble", flips)} but only have ${playerMarbles}!`,
          ephemeral: true,
        });
        return;
      }
      data.marbles[interaction.user.id] -= flips;
      data.multiFlips[flips] = { initiator: interaction.user.id };
      await interaction.reply(
        `<@${interaction.user.id}> offered a ${flips} multi-flip! \`/multi-flip ${flips}\` to accept.`,
      );
    },
  },
];

function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`;
}

function generateVenmoLink(
  amount: number,
  note: string,
  person: string,
  type: "pay" | "charge",
) {
  return `https://venmo.com/?txn=${type}&recipients=${encodeURIComponent(person)}&amount=${encodeURIComponent(
    amount.toString(),
  )}&note=${encodeURIComponent(note)}`;
}
