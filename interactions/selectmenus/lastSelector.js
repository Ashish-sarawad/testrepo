const Discord = require('discord.js')
const loadingCard = require('../../templates/loadingCard')
const { updateOptions } = require('../../functions/dateStats')
const { getMatchItems } = require('../../commands/last')
const { getStats } = require('../../functions/apiHandler')

const updateEmbedMessage = async (interaction, playerId, matchId, map) => {
  const {
    playerDatas,
    steamDatas,
    playerHistory
  } = await getStats({
    playerParam: {
      param: playerId,
      faceitId: true
    },
    matchNumber: 0,
    map: map || '',
  })

  return getMatchItems(interaction, playerDatas, steamDatas, playerHistory, matchId)
}

module.exports = {
  name: 'lastSelector',
  async execute(interaction, values) {
    const optionsComponents = interaction.message.components.at(1).components
    const paginationComponents = interaction.message.components.at(2)
    const playerStatsCard = interaction.message.embeds.filter(e => e.data.image.url.includes('graph'))?.at(0)

    loadingCard(interaction)

    const components = [
      values.dataRow,
      new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.StringSelectMenuBuilder()
            .setCustomId('lastSelector')
            .addOptions(updateOptions(optionsComponents, values.l, false))),
      paginationComponents
    ]

    const messageItems = await updateEmbedMessage(interaction, values.s, values.l, values.m)
    if (playerStatsCard) messageItems.embeds.unshift(playerStatsCard)

    return {
      ...messageItems,
      components: components
    }
  },
  getJSON(interaction, json) {
    const dataRow = interaction.message.components.at(0)
    const value = JSON.parse(dataRow.components.at(0).options.at(0).value)
    const m = interaction.values.at(0)

    return { ...value, l: m, dataRow }
  },
  updateUser(interaction) {
    const values = this.getJSON(interaction)
    const dataRowValues = JSON.parse(values.dataRow.components.at(0).options.at(0).value)
    dataRowValues.u = interaction.user.id
    values.dataRow.components.at(0).options.at(0).value = JSON.stringify(dataRowValues)

    return values
  }
}