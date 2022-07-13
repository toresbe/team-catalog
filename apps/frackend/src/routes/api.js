import axios from 'axios'
import config from '../config.js'
import setOnBehalfOfToken from '../auth/onbehalfof.js'

const teamCatScope = config.proxy.teamCatScope
const nomScope = config.proxy.nomApiScope
const apiUrl = config.proxy.teamCatBackendUrl

const teamsApi = apiUrl + '/team?status=ACTIVE'
const clustersApi = apiUrl + '/cluster?status=ACTIVE'
const productareasApi = apiUrl + '/productarea?status=ACTIVE'

function getMemberIdents(teamcatEntity) {
  let members = new Set([])
  const teamArray = teamcatEntity.data.content
  teamArray.forEach((team) => {
    team.members.forEach((member) => {
      members.add(member.navIdent)
    })
  })

  return members
}

function getAllTeamCatIdents(clusters, teams, areas) {
  let out = new Set([])
  getMemberIdents(clusters).forEach((navIdent) => out.add(navIdent))
  getMemberIdents(teams).forEach((navIdent) => out.add(navIdent))
  getMemberIdents(areas).forEach((navIdent) => out.add(navIdent))

  return Array.from(out)
}

async function getFromTeamCat(req, apiUrl) {
  return await axios
    .get(apiUrl, {
      headers: {
        Authorization: 'Bearer ' + req.session[teamCatScope].accessToken,
      },
    })
    .catch((error) => {
      console.log(error)
    })
}

function nomRessourceListQuery(identList) {
  const identListString =
    '[' + identList.map((ident) => `"${ident}"`).join(',') + ']'

  return `query HentAlleRessurser{
        ressurser(where: {navIdenter: ${identListString}} ) {
            id
            ressurs{
                navIdent
                personIdent
    fornavn
            }
            code
        }
    }`
}

async function getFromNom(req, idents) {
  return await axios
    .post(config.proxy.nomApiUrl + '/graphql', nomRessourceListQuery(idents), {
      headers: {
        Authorization: 'Bearer ' + req.session[nomScope].accessToken,
        'Content-Type': 'application/graphql',
      },
    })
    .catch((error) => {
      console.log(error)
    })
}

function setupApi(app) {
  app.get(
    '/api/teamcatTabell',
    (req, res, next) => {
      setOnBehalfOfToken.addTokenToSession(req, res, next, teamCatScope)
    },
    (req, res, next) => {
      setOnBehalfOfToken.addTokenToSession(req, res, next, nomScope)
    },
    async (req, res, next) => {
      const teams = await getFromTeamCat(req, teamsApi)
      const clusters = await getFromTeamCat(req, clustersApi)
      const areas = await getFromTeamCat(req, productareasApi)

      const idents = getAllTeamCatIdents(teams, clusters, areas)

      const nomRessources = await getFromNom(req, idents)
      res.send({
        len: idents.length,
        out: idents,
        nomRessources: nomRessources,
      })
    }
  )
}

export default setupApi
