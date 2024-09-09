import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import {
  clearHandGame,
  createHandGame,
  getCurrentHandGame,
  getMarbles,
  setMarbles,
} from "./gaming";

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
      await interaction.reply({
        content: `Venmo austin @ ${link}`,
        ephemeral: true,
      });
      const existingMarbles = getMarbles(interaction.user.id);
      setMarbles(interaction.user.id, existingMarbles + amount);
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
          .setRequired(true),
      ),
    async execute(interaction: ChatInputCommandInteraction) {
      const amount = interaction.options.getInteger("amount", true);

      // check if user has enough marbles
      const existingMarbles = getMarbles(interaction.user.id);
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
      setMarbles(interaction.user.id, existingMarbles - amount);

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
      const marbles = getMarbles(interaction.user.id);
      await interaction.reply({
        content: `You have ${marbles} ${pluralize("marble", marbles)}`,
        ephemeral: true,
      });
    },
  },
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
            {
              name: "left",
              value: "left",
            },
            {
              name: "right",
              value: "right",
            },
          ]),
      ),
    async execute(interaction: ChatInputCommandInteraction) {
      const hand = interaction.options.getString("hand", true) as
        | "left"
        | "right";
      if (getCurrentHandGame()) {
        await interaction.reply(
          "There is already a hand game in progress! Use **/accept-hand-game** to play.",
        );
        return;
      } else {
        const userMarbles = getMarbles(interaction.user.id);
        if (userMarbles < 1) {
          await interaction.reply({
            content: "You need at least 1 marble to make a hand game!",
            ephemeral: true,
          });
          return;
        }
        // TODO: think about race conditions
        setMarbles(interaction.user.id, userMarbles - 1);
        createHandGame(interaction.user.id, hand);
        await interaction.reply(
          `<@${interaction.user.id}> has made a hand game for $1! Use **/accept-hand-game** to play.`,
        );
      }
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
          .addChoices([
            {
              name: "left",
              value: "left",
            },
            {
              name: "right",
              value: "right",
            },
          ]),
      ),
    async execute(interaction: ChatInputCommandInteraction) {
      const hand = interaction.options.getString("hand", true) as
        | "left"
        | "right";
      const game = getCurrentHandGame();
      if (game) {
        const playerMarbles = getMarbles(interaction.user.id);
        if (playerMarbles < 1) {
          await interaction.reply({
            content: "You need at least 1 marble to accept a hand game!",
            ephemeral: true,
          });
          return;
        }
        await setMarbles(interaction.user.id, playerMarbles - 1);
        const winner =
          game.hand === hand ? interaction.user.id : game.initiator;
        setMarbles(winner, getMarbles(winner) + 2);
        await clearHandGame();
        await interaction.reply(
          `<@${interaction.user.id}> guessed ${
            game.hand === hand ? "correctly" : "incorrectly"
          } with ${hand}! <@${winner}> won a marble!`,
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
      .setDescription("Cancel a hand game you made"),
    async execute(interaction: ChatInputCommandInteraction) {
      const game = getCurrentHandGame();
      if (game && game.initiator === interaction.user.id) {
        setMarbles(interaction.user.id, getMarbles(interaction.user.id) + 1);
        await clearHandGame();
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
