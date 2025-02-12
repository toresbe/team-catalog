import axios from "axios";

import type { Cluster, ClusterFormValues, PageResponse } from "../constants";
import type { Status } from "../constants";
import { ampli } from "../services/Amplitude";
import { env } from "../util/env";

export const deleteCluster = async (clusterId: string) => {
  await axios.delete(`${env.teamCatalogBaseUrl}/cluster/${clusterId}`);
};

export type ClustersSearchParameters = {
  status?: Status;
};

export const getAllClusters = async (clustersSearchParameters: ClustersSearchParameters) => {
  return (
    await axios.get<PageResponse<Cluster>>(`${env.teamCatalogBaseUrl}/cluster`, { params: clustersSearchParameters })
  ).data;
};

export const getCluster = async (clusterId: string) => {
  return (await axios.get<Cluster>(`${env.teamCatalogBaseUrl}/cluster/${clusterId}`)).data;
};

export const createCluster = async (cluster: ClusterFormValues) => {
  try {
    ampli.logEvent("teamkatalog_create_cluster");
    return (await axios.post<Cluster>(`${env.teamCatalogBaseUrl}/cluster`, cluster)).data;
  } catch (error: any) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Klyngen eksisterer allerede. Endre i eksisterende klynge ved behov.";
    }
    return error.response.data.message;
  }
};

export const editCluster = async (cluster: ClusterFormValues) => {
  ampli.logEvent("teamkatalog_edit_cluster");
  return (await axios.put<Cluster>(`${env.teamCatalogBaseUrl}/cluster/${cluster.id}`, cluster)).data;
};

export const searchClusters = async (term: string) => {
  return (await axios.get<PageResponse<Cluster>>(`${env.teamCatalogBaseUrl}/cluster/search/${term}`)).data;
};
