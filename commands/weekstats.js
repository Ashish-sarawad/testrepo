const Discord = require('discord.js')
const { maxMatchsDateStats } = require('../config.json')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')
const Options = require('../templates/options')

const getMonday = date => {
  const week = [6, 0, 1, 2, 3, 4, 5]

  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return new Date(date.setDate(date.getDate() - week[date.getDay()])).getTime()
}

const sendCardWithInfos = async (interaction, playerId) => {
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)

  const options = []
  const dates = await DateStats.getDates(playerId, maxMatchsDateStats, getMonday)
  let first = false

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(from.setDate(from.getDate() + 7))

    let option = {
      label: [new Date(date.date).toDateString(), '-', new Date(new Date(to).setHours(-24)).toDateString()].join(' '),
      description: `${date.number} match played`,
      value: JSON.stringify({
        s: playerId,
        f: date.date / 1000,
        t: to.getTime() / 1000,
        u: interaction.user.id
      })
    }

    if (!first) {
      first = true
      option = DateStats.setOption(option, true)
    } options.push(option)
  })

  if (options.length === 0) return errorCard(`Couldn\'t get matchs of ${playerDatas.nickname}`)
  if (playerStats.lifetime.Matches > maxMatchsDateStats) options.pop()
  const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('dateStatsSelector')
        .setPlaceholder('Select a week')
        .addOptions(options.slice(0, 25)))

  return DateStats.getCardWithInfos(row, JSON.parse(options[0].value), CustomType.TYPES.ELO, maxMatchsDateStats, 'uDSG')
}

module.exports = {
  name: 'weekstats',
  options: Options.stats,
  description: 'Displays the stats of the choosen week. With elo graph of the week.',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos
