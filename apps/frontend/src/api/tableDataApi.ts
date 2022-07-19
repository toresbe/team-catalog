import axios from 'axios'
import { env } from '../util/env'

export interface TableStructure {
  name: { name: string; ident: string }
  team: { name?: string; id?: string }
  area: { name?: string; id?: string }
  cluster: { name?: string; id?: string }
  roles: string
  other: string
  type: string
  employedIn: string
}

export const getTableDAta = async () => {
  return (await axios.get<TableStructure>(`${env.teamCatalogBaseUrl}/api/teamcatTabell`)).data
}
