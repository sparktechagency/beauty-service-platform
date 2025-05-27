import { Request } from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import ApiError from "../../errors/ApiErrors";
import { DOCUMENT_TYPE } from "../../enums/document";

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      
      let uploadDir;
      switch (file.fieldname) {
        case "feature":
          uploadDir = path.join(baseUploadDir, "feature");
          break;
        case "image":
          uploadDir = path.join(baseUploadDir, "image");
          break;
        case "additional":
          uploadDir = path.join(baseUploadDir, "additional");
          break;
        case "background":
          uploadDir = path.join(baseUploadDir, DOCUMENT_TYPE.BACKGROUND);
          break;
        case "work":
          uploadDir = path.join(baseUploadDir, "work");
          break;
        case "profile":
          uploadDir = path.join(baseUploadDir, "profile");
          break;

        case "media":
          uploadDir = path.join(baseUploadDir, "media");
          break;
        case "doc":
          uploadDir = path.join(baseUploadDir, "doc");
          break;
        case "license":
          uploadDir = path.join(baseUploadDir, "license");
        break;
        case "dashboard":
          uploadDir = path.join(baseUploadDir, "dashboard");
          break;
        case "portfolio":
          uploadDir = path.join(baseUploadDir, "portfolio");
          break;
        default:
          throw new ApiError(StatusCodes.BAD_REQUEST, "File is not supported");
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  //file filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (
      file.fieldname === "image" ||
      file.fieldname === "work" ||
      file.fieldname === "background" ||
      file.fieldname === "feature" ||
      file.fieldname === "profile" ||
      file.fieldname === "additional"||
      file.fieldname === "license" ||
      file.fieldname === "dashboard" ||
      file.fieldname === "portfolio"
    ) {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "Only .jpeg, .png, .jpg file supported"
          )
        );
      }
    } else if (file.fieldname === "media") {
      if (file.mimetype === "video/mp4" || file.mimetype === "audio/mpeg") {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "Only .mp4, .mp3, file supported"
          )
        );
      }
    } else if (file.fieldname === "doc") {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, "Only pdf supported"));
      }
    } else {
      cb(new ApiError(StatusCodes.BAD_REQUEST, "This file is not supported"));
    }
  };

  const upload = multer({
    storage: storage,
    // @ts-ignore
    fileFilter: filterFilter,
  }).fields([
    { name: "image", maxCount: 10 },
    { name: "profile", maxCount: 1 },
    { name: "media", maxCount: 3 },
    { name: "doc", maxCount: 3 },
    { name: "feature", maxCount: 1 },
    { name: "additional", maxCount: 5 },
    { name: "work", maxCount: 5 },
    { name: "background", maxCount: 1 },
    { name: "license", maxCount: 1 },
    { name: "dashboard", maxCount: 1 },
    { name: "portfolio", maxCount: 1 },
  ]);
  return upload;
};

export default fileUploadHandler;
