import React, {useEffect} from "react"
import {ProductTeam, ResourceType, TeamType} from '../../constants'
import {getAllProductAreas, getAllTeams} from '../../api'
import {Cell, Row, Table} from '../common/Table'
import {intl} from '../../util/intl/intl'
import {HeadingLarge} from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import {Spinner} from '../common/Spinner'
import {useHistory} from "react-router-dom"

export enum TeamSize {
  EMPTY = '0_1',
  UP_TO_5 = '1_6',
  UP_TO_10 = '6_11',
  UP_TO_20 = '11_21',
  OVER_20 = '21_1000'
}

export enum TeamExt {
  _0p = '0_1',
  UP_TO_25p = '0_26',
  UP_TO_50p = '26_51',
  UP_TO_75p = '51_76',
  UP_TO_100p = '76_101'
}

export const TeamList = (props: { teamType?: TeamType, teamSize?: TeamSize, teamExt?: TeamExt }) => {
  const {teamSize, teamType, teamExt} = props
  const [loading, setLoading] = React.useState(true)
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [paList, setPaList] = React.useState<Record<string, string>>({})
  const [filtered, setFiltered] = React.useState<ProductTeam[]>([])
  const history = useHistory()
  const productAreaId = new URLSearchParams(history.location.search).get('productAreaId')

  const filter = (list: ProductTeam[]) => {
    if (productAreaId) {
      list = list.filter(t => t.productAreaId === productAreaId)
    }
    if (teamType) {
      list = list.filter(t => t.teamType === teamType)
    }
    if (teamSize) {
      const from = parseInt(teamSize.substr(0, teamSize.indexOf('_')))
      const to = parseInt(teamSize.substr(teamSize.indexOf('_') + 1))
      list = list.filter(t => t.members.length >= from && t.members.length < to)
    }
    if (teamExt) {
      const from = parseInt(teamExt.substr(0, teamExt.indexOf('_')))
      const to = parseInt(teamExt.substr(teamExt.indexOf('_') + 1))
      list = list.filter(t => {
        const ext = t.members.filter(m => m.resource.resourceType === ResourceType.EXTERNAL).length
        const extP = t.members.length === 0 ? 0 : ext * 100 / t.members.length
        return extP >= from && extP < to
      })
    }
    return list
  }

  useEffect(() => {
    (async () => {
      setTeamList((await getAllTeams()).content)
      const pas: Record<string, string> = {};
      (await getAllProductAreas()).content.forEach(pa => pas[pa.id] = pa.name)
      setPaList(pas)
      setLoading(false)
    })()
  }, [])

  useEffect(() => setFiltered(filter(teamList)), [teamList, teamSize, teamType])

  return (
    <>
      <HeadingLarge>Teams ({filtered.length})</HeadingLarge>
      {loading && <Spinner size='80px'/>}
      {!loading &&
      <Table emptyText={'team'}
             data={filtered}
             config={{
               useDefaultStringCompare: true,
               initialSortColumn: 'name',
               sorting: {
                 members: (a, b) => b.members.length - a.members.length,
                 productAreaId: (a, b) => (paList[a.productAreaId] || '').localeCompare(paList[b.productAreaId] || '')
               }
             }
             }
             headers={[
               {title: 'Navn', column: 'name'},
               {title: 'Område', column: 'productAreaId'},
               {title: 'Type', column: 'teamType'},
               {title: 'Medlemmer', column: 'members'},
             ]}
             render={table => table.data.map(team =>
               <Row key={team.id}>
                 <Cell><RouteLink href={`/team/${team.id}`}>{team.name}</RouteLink></Cell>
                 <Cell><RouteLink href={`/productarea/${team.productAreaId}`}>{paList[team.productAreaId]}</RouteLink></Cell>
                 <Cell>{intl[team.teamType]}</Cell>
                 <Cell>{team.members.length}</Cell>
               </Row>)}/>}
    </>
  )
}
