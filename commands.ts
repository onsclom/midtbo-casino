import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getMarbles, setMarbles } from "./gaming";

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
      await interaction.reply(
        `You have ${marbles} ${pluralize("marble", marbles)}`,
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
