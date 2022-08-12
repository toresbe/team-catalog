import React, { useEffect, useState } from 'react'
import { Cluster, Member, ProductArea, ProductTeam, Resource, ResourceType, ResourceUnits, TeamRole } from '../../constants'
import { getAllProductAreas, getAllTeams, getResourceById, getResourceUnitsById } from '../../api'
import { Cell, Row, Table } from '../common/Table'
import { intl } from '../../util/intl/intl'
import { HeadingLarge } from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import { CustomSpinner } from '../common/Spinner'
import { Block } from 'baseui/block'
import { MemberExport } from '../Members/MemberExport'
import { rolesToOptions } from '../Members/FormEditMember'
import * as _ from 'lodash'
import { useQueryParam } from '../../util/hooks'
import { getAllClusters, mapClusterToFormValues } from '../../api/clusterApi'
import ModalContactMembers from './ModalContactMembers'
import { UserImage } from '../common/UserImage'
import axios from 'axios'
import { env } from '../../util/env'

export type MemberExt = Member &
  Partial<Resource> & {
    team?: ProductTeam
    productArea?: ProductArea
    cluster?: Cluster
  }

interface TableStructure {
  ressource: { name: string; ident: string }
  team: { name?: string; id?: string }
  area: { name?: string; id?: string }
  cluster: { name?: string; id?: string }
  roles: TeamRole[]
  other: string
  type: ResourceType
  employedIn: string
}

const getTableData = async () => {
  return (await axios.get<TableStructure[]>(`${env.teamCatalogFrackEndApi}/teamcatTabell`)).data
}

const useTable = () => {
  const [tableData, setTableData] = useState<TableStructure[]>()

  useEffect(() => {
    getTableData().then(setTableData)
  }, [])

  return tableData
}

export const MemberList = (props: { role?: TeamRole; leaderIdent?: string }) => {
  const { role, leaderIdent } = props
  const [loading, setLoading] = React.useState(true)
  const [members, setMembers] = React.useState<MemberExt[]>([])
  const [filtered, setFiltered] = React.useState<MemberExt[]>([])
  const [pasMap, setPasMap] = React.useState<Record<string, string>>({})
  const [clusterMap, setClusterMap] = React.useState<Record<string, string>>({})
  const [leader, setLeader] = React.useState<(Resource & ResourceUnits) | undefined>()
  const productAreaId = useQueryParam('productAreaId')
  const clusterId = useQueryParam('clusterId')
  const tableData = useTable()

  console.log({ tableData })

  useEffect(() => {
    ;(async () => {
      const fetches: Promise<any>[] = []
      const membersExt: MemberExt[] = []
      fetches.push(
        (async () => {
          membersExt.push(...(await getAllTeams('active')).content.flatMap((t) => t.members.map((m) => ({ ...m.resource, ...m, team: t }))))
        })()
      )
      fetches.push(
        (async () => {
          const pas = await getAllProductAreas('active')
          const pasMapB: Record<string, string> = {}
          pas.content.forEach((pa) => (pasMapB[pa.id] = pa.name))
          setPasMap(pasMapB)
          membersExt.push(...pas.content.flatMap((pa) => pa.members.map((m) => ({ ...m.resource, ...m, productArea: pa }))))
        })()
      )
      fetches.push(
        (async () => {
          const cls = await getAllClusters('active')
          const clusterMapB: Record<string, string> = {}
          cls.content.forEach((cl) => (clusterMapB[cl.id] = cl.name))
          setClusterMap(clusterMapB)
          membersExt.push(...cls.content.flatMap((cl) => cl.members.map((m) => ({ ...m.resource, ...m, cluster: cl }))))
        })()
      )
      await Promise.all(fetches)
      setMembers(membersExt)
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    let list = members
    if (productAreaId) {
      const clusterLevel = [...list.filter((l) => l.cluster && l.cluster.productAreaId === productAreaId)]
      const areaLevel = [...list.filter((m) => m.team?.productAreaId === productAreaId || m.productArea?.id === productAreaId)]
      list = [...clusterLevel, ...areaLevel]
    }
    if (clusterId) {
      const clusterList = [...list.filter((m) => m.cluster && m.cluster.id === clusterId)]
      const teamList = [...list.filter((m) => (m.team?.clusterIds || []).indexOf(clusterId) >= 0)]
      list = [...clusterList, ...teamList]
    }
    if (role) {
      list = list.filter((m) => m.roles.indexOf(role) >= 0)
    }
    if (leader) {
      list = list.filter((m) => leader.members.find((r) => r.navIdent === m.navIdent))
    }
    setFiltered(list)
  }, [members, role, leader])

  useEffect(() => {
    if (!leaderIdent || !members.length) {
      setLeader(undefined)
      return
    }
    ;(async () => {
      const leaderObject = await getResourceById(leaderIdent)
      if (!leaderObject) return
      try {
        const units = await getResourceUnitsById(leaderIdent)
        !!units && setLeader({ ...leaderObject, ...units })
      } catch (e: any) {
        console.debug(`cant find units for ${leaderIdent}`)
      }
    })()
  }, [members, leaderIdent])

  return (
    <>
      <HeadingLarge>
        <Block display="flex" justifyContent="space-between">
          <span>
            Medlemmer {role ? ` - Rolle: ${intl[role]}` : ''} {leaderIdent ? ` - Leder: ${leader?.fullName || leaderIdent}` : ''}{' '}
            {productAreaId ? ` - Område: ${pasMap[productAreaId]}` : ''} {clusterId ? ` - Klynge: ${clusterMap[clusterId]}` : ''} ({filtered.length})
          </span>
          <div>
            <MemberExport clusterId={clusterId} productAreaId={productAreaId} role={role} leaderIdent={leaderIdent} />
            <ModalContactMembers members={filtered} />
          </div>
        </Block>
      </HeadingLarge>
      {loading && <CustomSpinner size="80px" />}
      {!loading && (
        <Table
          emptyText={'team'}
          data={tableData || []}
          config={{
            pageSizes: [10, 20, 50, 100, 500, 1000, 10000],
            defaultPageSize: 100,
            useDefaultStringCompare: true,
            initialSortColumn: 'ressource',
            sorting: {
              team: (a, b) => (a.team?.name || '').localeCompare(b.team?.name || ''),
              area: (a, b) => (a.area?.name || '').localeCompare(b.team?.name || ''),
              // roles: (a, b) => (a.roles || '').localeCompare(b.roles || ''),
            },
            filter: {
              ressource: { type: 'search' },
              team: { type: 'select', mapping: (m) => ({ id: m.team?.id, label: m.team?.name }) },
              area: {
                type: 'select',
                options: (ms) =>
                  _.uniqBy(
                    ms
                      .map((m) => m.area?.id)
                      .filter((id) => !!id)
                      .map((id) => ({ id: id, label: pasMap[id!] })),
                    (pa) => pa.id
                  ),
                mapping: (m) => ({ id: m.area?.id, label: m.area?.name }),
              },
              roles: {
                type: 'select',
                options: (ms) => rolesToOptions(_.uniq(ms.flatMap((m) => m.roles))),
                mapping: (m) => rolesToOptions(m.roles),
              },
              type: { type: 'select', mapping: (m) => ({ id: m.type, label: intl[m.type] }) },
            },
          }}
          headers={[
            { title: '#', $style: { maxWidth: '15px' } },
            { title: 'Bilde', $style: { maxWidth: '40px' } },
            { title: 'Navn', column: 'ressource' },
            { title: 'Team', column: 'team' },
            { title: 'Område', column: 'area' },
            { title: 'Klynger', column: 'cluster' },
            { title: 'Roller', column: 'roles' },
            { title: 'Annet', column: 'other' },
            { title: 'Type', column: 'type' },
          ]}
          render={(table) =>
            table.data.slice(table.pageStart, table.pageEnd).map((member, idx) => (
              <Row key={idx}>
                <Cell $style={{ maxWidth: '15px' }}>{(table.page - 1) * table.limit + idx + 1}</Cell>
                <Cell $style={{ maxWidth: '40px' }}>
                  <UserImage ident={member.ressource.ident} size="40px" />
                </Cell>
                <Cell>
                  <RouteLink href={`/resource/${member.ressource.ident}`}>{member.ressource.name}</RouteLink>
                </Cell>
                <Cell>
                  <RouteLink href={`/team/${member?.team?.id}`}>{member.team?.name}</RouteLink>
                </Cell>
                <Cell>
                  {member.area && <RouteLink href={`/productArea/${member.area.id}`}>{member.area.name}</RouteLink>}
                  {member.team?.id && <Block $style={{ opacity: '.75' }}>{pasMap[member.team.id]}</Block>}
                </Cell>
                <Cell>
                  {member.cluster && <RouteLink href={`/cluster/${member.cluster.id}`}>{member.cluster.name}</RouteLink>}
                  {member.team && <Block $style={{ opacity: '.75' }}>{member.cluster.name || ''}</Block>}
                </Cell>
                <Cell>{member.roles}</Cell>
                <Cell>{member.other}</Cell>
                <Cell>{intl[member.type]}</Cell>
              </Row>
            ))
          }
        />
      )}
    </>
  )
}
