const GuildRoles = require('../database/guildRoles')
const User = require('../database/user')
const Player = require('./player')

const updateRoles = async (client, discordId, guildId, remove = false) => {
  let users = await User.getAll()
  let guilds = await GuildRoles.getAll()
  if (discordId) users = await User.get(discordId)
  if (guildId) guilds = [await GuildRoles.getRolesOf(guildId)]

  if (!guilds.filter(e => e).find(e => e.id === guildId) && remove) User.remove(discordId, guildId)

  const clientGuilds = await client.guilds.fetch()

  clientGuilds.forEach(async (guild) => {
    const guildRoles = guilds.filter(e => e).find(e => e.id === guild.id)
    const guildDatas = await guild.fetch()

    if (!guildRoles) return

    guildDatas.members.fetch({ user: users.filter(e => e.guildId === guildDatas.id || !e.guildId).map(e => e.discordId) })
      .then(async members => members.forEach(async (member) => {
        let user = await User.get(member.user.id)
        if (!(user.length > 0)) return
        else if (user.length > 1) user = user.filter(e => e.guildId === guildDatas.id)

        user = user.flat().at(0)

        const playerDatas = await Player.getDatas(user.faceitId).catch(console.error)
        const playerLevel = playerDatas.games.csgo.skill_level
        const roleLevels = Object.keys(Object.entries(guildRoles)[2][1])
          .filter(e => e.startsWith('level')).map(e => guildRoles[e])

        const roleToAdd = roleLevels[playerLevel - 1]
        const rolesFit = member.roles.resolve(roleToAdd)

        if (rolesFit && !remove) return

        await member.roles.remove(roleLevels).catch(console.error)

        if (remove) {
          User.remove(discordId, guildId)
          return
        }

        await member.roles.add(roleToAdd).catch(console.error)
      }))
      .catch(console.error)
  })
}

module.exports = {
  updateRoles
}