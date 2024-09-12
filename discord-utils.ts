import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export async function replyWithEmbed(
  interaction: ChatInputCommandInteraction,
  title: string,
  description: string,
  ephemeral = false,
) {
  await interaction.reply({
    embeds: [new EmbedBuilder().setTitle(title).setDescription(description)],
    ephemeral,
  });
}
