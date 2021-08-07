const { default: fetch } = require('node-fetch')

require('dotenv').config()

const headerFaceit = {
  Authorization: `Bearer ${process.env.FACEIT_TOKEN}`
}

const fetchData = async (url) => {
  return await fetch(`${url}`, {
    method: 'GET',
    headers: headerFaceit
  })
    .then(res => {
      if (res.status == 200) return res.json()
      else throw 'An error has occured'
    })
    .then(data => {
      return data
    })
}

module.exports = {
  fetchData
}