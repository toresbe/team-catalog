export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

export interface PageResponse<T> {
  pageNumber: number;
  pageSize: number;
  pages: number;
  numberOfElements: number;
  totalElements: number;
  content: T[];
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
  id: string;
  name: string;
  description: string;
}

export interface ProductAreaFormValues {
  id?: string;
  description: string;
  name: string;
}

export interface ProductTeam {
  id: string;
  name: string;
  description: string;
  slackChannel: string;
  productAreaId: string;
  naisTeams: string[];
  members: Member[];
}

export interface ProductTeamFormValues {
  id?: string;
  name: string;
  description: string;
  slackChannel: string;
  productAreaId: string;
  naisTeams: string[];
  members: Member[];
}

export interface Member {
  navIdent: string;
  name: string;
  role: string;
  email: string;
  resourceType: string;
}

export interface Resource {
  navIdent: string;
  givenName: string;
  familyName: string;
  email: string;
}
