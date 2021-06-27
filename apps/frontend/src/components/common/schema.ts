import * as yup from 'yup';
import {
  AddressType,
  AreaType,
  ClusterFormValues,
  ContactAddress,
  Location,
  MemberFormValues,
  OwnerRole,
  ProductAreaFormValues,
  ProductAreaOwnerFormValues,
  ProductTeamFormValues,
  ResourceType,
  TeamRole,
  TeamType
} from '../../constants';

const errorMessage = "Feltet er påkrevd";

export const productAreaSchema: () => yup.SchemaOf<ProductAreaFormValues> = () =>
  yup.object({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    areaType: yup.mixed().oneOf(Object.values(AreaType), errorMessage).required(errorMessage),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    members: yup.array().of(memberSchema()).required(),
    tags: yup.array().of(yup.string().required()).required(),
    locations: yup.array().of(location()).required(),
    owners: yup.array().of(ownerSchema()).required()

  });

const location: () => yup.SchemaOf<Location> = () =>
  yup.object({
    floorId: yup.string().required(errorMessage),
    locationCode: yup.string().required(errorMessage),
    x: yup.number().required(errorMessage),
    y: yup.number().required(errorMessage)
  })

export const clusterSchema: () => yup.SchemaOf<ClusterFormValues> = () =>
  yup.object({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    tags: yup.array().of(yup.string().required()).required(),
    productAreaId: yup.string(),
    members: yup.array().of(memberSchema()).required()
  });

const contactAddress: () => yup.SchemaOf<ContactAddress> = () =>
  yup.object({
    address: yup.string().required(errorMessage),
    type: yup.mixed().oneOf(Object.values(AddressType), errorMessage).required(errorMessage),
    slackUser: yup.mixed().nullable(),
    slackChannel: yup.mixed().nullable()
  })

export const teamSchema: () => yup.SchemaOf<ProductTeamFormValues> = () =>
  yup.object({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    productAreaId: yup.string(),
    clusterIds: yup.array().of(yup.string().required()).required(),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    contactPersonIdent: yup.string(),
    contactPersonResource: yup.mixed().optional(),
    naisTeams: yup.array().of(yup.string().required()).required(),
    members: yup.array().of(memberSchema().required()).required(),
    qaTime: yup.string(),
    teamType: yup.mixed().oneOf(Object.values(TeamType), errorMessage).required(errorMessage),
    tags: yup.array().of(yup.string().required()).required(),
    locations: yup.array().of(location()).required(),
    contactAddresses: yup.array().of(contactAddress()).required(),    
  });

const teamRoleSchema: yup.SchemaOf<TeamRole> = yup.mixed().oneOf(Object.values(TeamRole), errorMessage + ": Rolle").required(errorMessage)

const productAreaOwnerRoleSchema: yup.SchemaOf<OwnerRole> = yup.mixed().oneOf(Object.values(OwnerRole), errorMessage + ": Rolle").required(errorMessage);


export const memberSchema: () => yup.SchemaOf<MemberFormValues> = () =>
  yup.object({
    navIdent: yup.string().required(errorMessage + ": Ansatt"),
    roles: yup.array().of(teamRoleSchema).min(1, errorMessage + ": Rolle").required(),
    description: yup.string(),
    fullName: yup.string(),
    resourceType: yup.mixed().oneOf(Object.values(ResourceType))
  });


  export const ownerSchema: () => yup.SchemaOf<ProductAreaOwnerFormValues> = () =>
  yup.object({
    navIdent: yup.string().required(errorMessage + ": Ansatt"),
    role: yup.mixed().oneOf(Object.values(OwnerRole)).required(),
    description: yup.string(),
    fullName: yup.string(),
    resourceType: yup.mixed().oneOf(Object.values(ResourceType))
  });
