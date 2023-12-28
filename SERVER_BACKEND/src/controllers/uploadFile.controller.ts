import { UserRequest } from "../userRequestTypes/userRequest.types";
import { Response } from "express";
import multer from "multer";
import * as FileType from "file-type";
import fs from "fs";

const storageClient = multer.diskStorage({
  destination: function (req, file, cb) {
    // Copy the relative path of the folder where you want to save the file, paste it (as string), and add `../` in front of the path
    cb(null, "../CLIENT_FRONTEND/public/userUploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

const storageServer = multer.diskStorage({
  destination: function (req, file, cb) {
    // Copy the relative path of the folder where you want to save the file, paste it (as string), and add `../` in front of the path
    cb(null, "../SERVER_BACKEND/src/public/img");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

/**
 * Upload filter function used with multer, which filters files based on extension and media type.
 *
 * PROBLEM: if a user changes the extension of a .txt file to .png, this function will not filter the file.
 *
 * @param req
 * @param file
 * @param cb
 * @returns
 */
async function uploadFilter(req: UserRequest, file: Express.Multer.File, cb) {
  const fileExtensions: string[] = file.originalname.split(".");
  // console.log(fileExtensions); // 'img.png' -> [img, png]
  if (fileExtensions.length !== 2) {
    return cb(null, false);
  }
  const fileExtension = fileExtensions[1];
  if (
    fileExtension !== "png" &&
    fileExtension !== "jpg" &&
    fileExtension !== "jpeg"
  ) {
    return cb(null, false);
  }
  const mediaType = file.mimetype;
  if (mediaType !== "image/png" && mediaType !== "image/jpeg") {
    return cb(null, false);
  }
  return cb(null, true);
}

const uploadClient = multer({
  storage: storageClient,
  fileFilter: uploadFilter,
});
const uploadSingleFileClient = uploadClient.single("file");

const uploadServer = multer({
  storage: storageServer,
  fileFilter: uploadFilter,
});
const uploadSingleFileServer = uploadServer.single("file");

export async function uploadFile(req: UserRequest, res: Response) {
  uploadSingleFileServer(req, res, function (err) {
    const file = req.file;
    if (!file) {
      return;
    }

    if (err) {
      fs.unlinkSync(file.path);
      return;
    }

    // file-type version 16.5.4 is used. The newest version causes import errors (ESM).
    // This package is for detecting binary-based file formats, not text-based formats like .txt, .csv, .svg, etc.
    FileType.fromFile(file.path)
      .then((fileType) => {
        if (
          !fileType ||
          (fileType &&
            fileType.mime !== "image/png" &&
            fileType.mime !== "image/jpeg")
        ) {
          fs.unlinkSync(file.path);
          return;
        }
      })
      .catch((err) => {
        fs.unlinkSync(file.path);
        return;
      });
  });

  uploadSingleFileClient(req, res, function (err) {
    const file = req.file;

    if (!file) {
      return res.status(200).json(null);
    }

    if (err) {
      fs.unlinkSync(file.path);
      return;
    }

    // file-type version 16.5.4 is used. The newest version causes import errors (ESM).
    // This package is for detecting binary-based file formats, not text-based formats like .txt, .csv, .svg, etc.
    FileType.fromFile(file.path)
      .then((fileType) => {
        if (
          !fileType ||
          (fileType &&
            fileType.mime !== "image/png" &&
            fileType.mime !== "image/jpeg")
        ) {
          fs.unlinkSync(file.path);
          return;
        }
      })
      .catch((err) => {
        fs.unlinkSync(file.path);
        return;
      });
    return res.status(200).json(file.filename);
  });
}
