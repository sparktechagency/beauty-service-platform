import axios from "axios";
import config from "../../../config";

const checkrApi = axios.create({
  baseURL: "https://api.sandbox.checkr.com/v1",
  auth:{
    username:config.checkr.checkrApiKey!,
    password:""
  }
});

export const createCandidate = async (data: any) => {
    const response = await checkrApi.post("/candidates", data);
    console.log(response.data);
    
    return response.data;
};

export const createReport = async (candidateId: string, data: any) => {
    const response = await checkrApi.post(`/candidates/${candidateId}/reports`, data);
    return response.data;
};

export const getReport = async (candidateId: string, reportId: string) => {
    const response = await checkrApi.get(`/candidates/${candidateId}/reports/${reportId}`);
    return response.data;
};

export const getCandidate = async (candidateId: string) => {
    const response = await checkrApi.get(`/candidates/${candidateId}`);
    return response.data;
};

export const CheckrService = {
  createCandidate,
  createReport,
  getReport,
  getCandidate
};


