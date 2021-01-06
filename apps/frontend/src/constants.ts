export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

export enum AreaType {
  PRODUCT_AREA = 'PRODUCT_AREA',
  IT = 'IT',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER'
}

export enum TeamType {
  PRODUCT = 'PRODUCT',
  ADMINISTRATION = 'ADMINISTRATION',
  IT = 'IT',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN'
}

export enum TeamRole {
  DEVELOPER = "DEVELOPER",
  TESTER = "TESTER",
  LEAD = "LEAD",
  TECH_LEAD = "TECH_LEAD",
  TEST_LEAD = "TEST_LEAD",
  AGILE_COACH = "AGILE_COACH",
  ARCHITECT = "ARCHITECT",
  DATA_MANAGER = "DATA_MANAGER",
  DATA_SCIENTIST = "DATA_SCIENTIST",
  DESIGNER = "DESIGNER",
  DOMAIN_EXPERT = "DOMAIN_EXPERT",
  OPERATIONS = "OPERATIONS",
  DOMAIN_RESPONSIBLE = "DOMAIN_RESPONSIBLE",
  DOMAIN_RESOURCE = "DOMAIN_RESOURCE",
  BUSINESS_ANALYST = "BUSINESS_ANALYST",
  FUNCTIONAL_ADVISER = "FUNCTIONAL_ADVISER",
  SOLUTION_ARCHITECT = "SOLUTION_ARCHITECT",
  PRODUCT_OWNER = "PRODUCT_OWNER",
  PRODUCT_LEAD = "PRODUCT_LEAD",
  SECURITY_ARCHITECT = "SECURITY_ARCHITECT",
  TECHNICAL_ADVISER = "TECHNICAL_ADVISER",
  TECHNICAL_TESTER = "TECHNICAL_TESTER",
  MAINTENANCE_MANAGER = "MAINTENANCE_MANAGER",
  COMMUNICATION_ADVISER = "COMMUNICATION_ADVISER",
  AREA_LEAD = "AREA_LEAD",
  LEGAL_ADVISER = "LEGAL_ADVISER",
  SECURITY_CHAMPION = "SECURITY_CHAMPION",
  UU_CHAMPION = "UU_CHAMPION",
  PROFIT_COACH = "PROFIT_COACH",
  CONTROLLER = "CONTROLLER",
  OTHER = "OTHER",
}

export enum ResourceType {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
  OTHER = "OTHER"
}

export interface PageResponse<T> {
  pageNumber: number;
  pageSize: number;
  pages: number;
  numberOfElements: number;
  totalElements: number;
  content: T[];
}

export interface ChangeStamp {
  lastModifiedBy: string;
  lastModifiedDate: string;
}

export interface UserInfo {
  loggedIn: boolean;
  groups: string[];
  ident?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
}

export interface ProductArea {
  id: string
  name: string
  areaType?: AreaType
  description: string
  slackChannel?: string
  tags: string[]
  members: Member[]
  locations: Location[]
  changeStamp?: ChangeStamp
}

export interface ProductAreaFormValues {
  id?: string
  name: string
  areaType: AreaType
  description: string
  slackChannel?: string
  tags: string[]
  members: MemberFormValues[]
  locations: Location[]
}

export interface Cluster {
  id: string
  name: string
  description: string
  slackChannel?: string
  tags: string[]
  productAreaId?: string
  members: Member[]
  changeStamp?: ChangeStamp
}

export interface ClusterFormValues {
  id?: string
  name: string
  description: string
  slackChannel?: string
  productAreaId?: string
  tags: string[]
  members: MemberFormValues[]
}

export interface ProductTeam {
  id: string
  name: string
  description: string
  slackChannel?: string
  productAreaId?: string
  clusterIds: string[]
  naisTeams: string[]
  members: Member[]
  qaTime?: string
  teamType: TeamType
  changeStamp: ChangeStamp
  tags: string[]
  locations: Location[]
}

export interface ProductTeamFormValues {
  id?: string
  name: string
  description: string
  slackChannel?: string
  productAreaId?: string
  clusterIds: string[]
  naisTeams: string[]
  members: MemberFormValues[]
  qaTime?: string
  teamType: TeamType
  tags: string[]
  locations: Location[]
}

export interface MemberFormValues {
  navIdent: string;
  roles: TeamRole[];
  description?: string;

  // Visual only, not for submit
  fullName?: string;
  resourceType?: ResourceType;
}

export interface Member {
  navIdent: string;
  roles: TeamRole[];
  description?: string;
  resource: Partial<Resource>
}

export interface Resource {
  navIdent: string;
  email: string;
  familyName: string;
  fullName: string;
  givenName: string;
  startDate: string;
  endDate?: string;
  resourceType: ResourceType;
  stale: boolean
}

export interface NaisTeam {
  id: string
  name: string
  description: string
  slack: string
  members: {name: string, email: string}[]
  apps: {name: string, zone: string}[]
}

export interface Process {
  id: string
  name: string
  purposeCode: string
  purposeName: string
  purposeDescription: string
}

export interface Floor {
  id: string
  floorId: string
  name: string
  locationImageId: string
  dimY: number
  bubbleScale: number
}

export interface Location {
  floorId: string
  locationCode: string
  x: number
  y: number
}
