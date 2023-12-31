const { color, emojis } = require('../../config.json')
const Discord = require('discord.js')
const loadingCard = require('../../templates/loadingCard')
const UserTeam = require('../../database/userTeam')
const Team = require('../../database/team')
const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const { setOptionValues } = require('../../functions/dateStats')
const { getStats } = require('../../functions/apiHandler')

module.exports = {
  name: 'teamInfoSelector',
  async execute(interaction, values) {
    const options = interaction.message.components.at(0).components
      .filter(e => e instanceof Discord.StringSelectMenuComponent)
      .map(msm => {
        return msm.options.map(o => {
          const active = JSON.parse(o.value).tn.normalize() === values.tn.normalize()
          o.emoji = active ? emojis.select.balise : undefined
          o.default = active

          setOptionValues(o, values)

          return o
        })
      }).at(0)

    const components = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('teamInfoSelector')
          .addOptions(options))

    loadingCard(interaction)
    const currentTeam = await Team.getTeamSlug(values.tn)
    const teamUsers = await UserTeam.getTeamUsers(currentTeam.slug)

    // check if user is part of the team if not the creator
    let currentUser = await User.getWithGuild(interaction.user.id, null)
    if (!currentUser) currentUser = await User.getWithGuild(interaction.user.id, interaction.guild.id)

    if (currentTeam.creator !== interaction.user.id && currentUser) {
      const userIsPartOfTeam = teamUsers.find(user => user.faceitId === currentUser.faceitId)
      if (!userIsPartOfTeam) return {
        ...errorCard('error.command.teamNoAccess', interaction.locale),
        components: [
          components
        ]
      }
    }

    const usersInfo = await Promise.all(teamUsers.map(async user => {
      const {
        playerDatas,
      } = await getStats({
        playerParam: {
          param: user.faceitId,
          faceitId: true
        },
        matchNumber: 1
      })

      return {
        user: user,
        faceit: playerDatas
      }
    }))

    const embed = new Discord.EmbedBuilder()
      .setColor(color.primary)
      .setTitle(`${currentTeam.name}`)
      .setDescription(`**Slug**: ${currentTeam?.slug}\n**Public Access**: ${currentTeam.access ? 'Yes' : 'No'}`)

    if (usersInfo.length > 0) usersInfo.forEach(user => {
      embed.addFields({
        name: `${user.faceit.nickname}`,
        value: `[Steam](https://steamcommunity.com/profiles/${user.faceit.games.csgo.game_player_id})\n[Faceit](https://www.faceit.com/en/players/${user.faceit.nickname})`,
        inline: true,
      })
    })
    else embed.addFields({ name: 'Users', value: 'No users found', inline: true })

    return {
      embeds: [
        embed,
      ],
      components: [
        components
      ]
    }
  },
  getJSON(interaction, json) {
    return JSON.parse(interaction.values)
  }
}