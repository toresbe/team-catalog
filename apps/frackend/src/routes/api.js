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
          ressurs {
            navident
            personIdent
            fornavn
      
            orgTilknytning {
              orgEnhet {
                navn
                
              }
            }
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

function getDepartmen(ident, nomRessources) {
  let out = ''
  nomRessources.data.ressurser.forEach((member) => {
    if (ident === member.navIdent) {
      member.ressurs.orgTilknytning.forEach((unit) => {
        out.concat(unit.name + ', ')
      })
    }
  })
  out.slice(0, -1)
  return out
}

function createTableData(teams, clusters, areas, nomRessources) {
  let tableData = new Array()

  console.log(nomRessources)

  teams.forEach((team) => {
    if (team.members.length != 0) {
      team.members.forEach((member) => {
        let productAreaName
        let clusterData = ''
        let departmentName = getDepartmen(member.navIdent, nomRessources)

        if (team.productAreaId) {
          productAreaName = getName(areas, team.productAreaId)
        }
        if (team.clusterIds.length != 0) {
          let clusterData = getClusters(team.clusterIds, clusters)
        }

        let memberObject = {
          name: { name: member.resource.fullName, ident: member.navIdent },
          team: { name: team.name, id: team.id },
          area: { name: productAreaName, id: '' },
          cluster: clusterData,
          roles: member.roles.join(', '),
          other: '',
          type: member.resource.resourceType,
          employedIn: departmentName,
          // department: '',
        }

        // console.log(memberObject)
        tableData.push(memberObject)
      })
    }
  })

  areas.forEach((area) => {
    if (area.members.length != 0) {
      area.members.forEach((member) => {
        let clusterData = ''
        let departmentName = getDepartmen(member.navIdent, nomRessources)

        let memberObject = {
          name: { name: member.resource.fullName, ident: member.navIdent },
          team: { name: '', id: '' },
          area: { name: area.name, id: area.id },
          cluster: { name: '', id: '' },
          roles: member.roles.join(', '),
          other: '',
          type: member.resource.resourceType,
          employedIn: departmentName,
          // department: '',
        }

        // console.log(memberObject)
        tableData.push(memberObject)
      })
    }
  })

  clusters.forEach((cluster) => {
    if (cluster.members.length != 0) {
      cluster.members.forEach((member) => {
        let clusterData = ''
        let departmentName = getDepartmen(member.navIdent, nomRessources)

        let memberObject = {
          name: { name: member.resource.fullName, ident: member.navIdent },
          team: { name: '', id: '' },
          area: { name: '', id: '' },
          cluster: { name: cluster.name, id: cluster.id },
          roles: member.roles.join(', '),
          other: '',
          type: member.resource.resourceType,
          employedIn: departmentName,
          // department: '',
        }

        // console.log(memberObject)
        tableData.push(memberObject)
      })
    }
  })
  console.log(tableData.length)
  return tableData
}

function getClusters(clusterIds, clusters) {
  let clusterArray = new Array()

  clusterIds.forEach((clusterId) => {
    let clusterName = getName(clusters, clusterId)
    let clusterData = { name: clusterName, id: clusterId }

    clusterArray.push(clusterData)
  })
  return clusterArray
}

function getName(list, id) {
  let name = ''
  list.forEach((element) => {
    if (element.id === id) {
      name = element.name
    }
  })
  return name
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

      const tableData = createTableData(
        teams.data.content,
        clusters.data.content,
        areas.data.content,
        nomRessources.data
      )
      res.send({
        tableData: tableData,
        // dataLength: tableData.length,
        // data: tableData,
      })
    }
  )
}

export default setupApi
