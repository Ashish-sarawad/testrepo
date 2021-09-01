const { name, invite, color, creator, vote, github, join } = require('../config.json')
const Discord = require('discord.js')

module.exports = {
  name: 'infos',
  aliasses: ['infos', 'info', 'inf'],
  options: '',
  description: "Get the infos about the bot.",
  type: 'system',
  async execute(message, args) {
    message.channel.send(new Discord.MessageEmbed()
      .attachFiles([
        new Discord.MessageAttachment('./images/logo.png', 'logo.png')
      ])
      .setColor(color.primary)
      .setAuthor(`${name}`, 'attachment://logo.png')
      .setDescription(`**Bot infos**`)
      .addFields({ name: 'Creator', value: `<@${creator}>` },
        { name: 'Github', value: github },
        { name: 'Invitation link', value: invite },
        { name: 'Vote link', value: vote },
        { name: 'Server link', value: join })
      .setFooter(`${name} Infos`))
  }
}