const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Stats = require('../../commands/stats')
const GuildRoles = require('../../functions/roles')

module.exports = {
  name: 'stats',
  type: 2,
  async execute(interaction) {
    let user = await User.exists(interaction.targetId)
    if (!user) {
      user = await User.exists(interaction.targetId, interaction.guildId)
      if (!user) return errorCard('This user has not linked his profile')
    }
    await GuildRoles.updateRoles(interaction.client, user.discordId)
    return Stats.sendCardWithInfos(interaction, user.faceitId)
  }
}