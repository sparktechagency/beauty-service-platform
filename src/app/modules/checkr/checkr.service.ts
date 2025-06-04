import axios from "axios";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import fs from "fs";
import path from "path";
import { CandidateReport } from "../candidateReport/candidateReport.model";

interface CandidateInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zipcode: string;
  dob: string; // Format: YYYY-MM-DD
  no_middle_name: boolean;
  ssn: string;
}


async function checkRApi(url: string,method:"POST"|"GET", body?: any) {
  const apiKey = config.checkr.checkrApiKey;

  // Create the Basic Auth header
  const basicAuth = "Basic " + btoa(`${apiKey}:${apiKey}`);

  const res = await fetch(`https://api.checkr.com/v1/${url}`, {
    method: method,
    headers: {
      Authorization: basicAuth,
      "Content-Type": "application/json",
    },
    body: body,
  });
  return await res.json();
}

export const createCandidate = async (data: CandidateInput) => {
  const data1 = await checkRApi("candidates","POST" ,JSON.stringify(data));


  return data1;
};

export const createReport = async (candidateId: string) => {
  const response = await checkRApi(
    "reports",
    "POST",
    JSON.stringify({
      candidate_id: candidateId,
      package: "checkrdirect_basic_plus_criminal",
      work_locations: [
        {
          country: "US",
          state: "CA",
          city: "San Francisco",
        },
      ],
    })
  );
 if(response.id){
  await CandidateReport.create({
    candidateId: candidateId,
    reportId: response.id,
    status: response.status,
  })
 }
  return response;
};

export const getReport = async (candidateId: string) => {
  const candidate = await CandidateReport.findOne({
    candidateId: candidateId,
  });
  const response = await checkRApi(
    `reports/${candidate?.reportId}`,
    "GET",
  );

  if(response.id)
  {
   const status = await CandidateReport.findOneAndUpdate({
      reportId: response.id,
    },{
      status: response.status,
    },{new:true})

    return status;
  }

  return response;
  
};

export const getCandidate = async (candidateId: string) => {

}

const uploadDocumentOfCandidate = async (
  candidateId: string,
  filePath: string
) => {
  const file = fs.createReadStream(
    path.join(process.cwd(), "uploads", filePath)
  );
  const formData = new FormData();

  formData.append("type", "passport");


  const response = await checkRApi(
    `candidates/${candidateId}/documents`,
    `POST`,
    formData
  );


  return response.data;
};

export const CheckrService = {
  createCandidate,
  createReport,
  getReport,
  getCandidate,
  uploadDocumentOfCandidate,
};
