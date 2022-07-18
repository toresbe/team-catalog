import axios from 'axios'

export interface TableStructure {
  // TODO Endre interface
  name: string
}

export const getTableDAta = async () => {
  return (await axios.get<TableStructure>('/api/teamcatTabell')).data
}
