import type { AnyMessageContent } from "@whiskeysockets/baileys";

type Media={filename:string;mime:string;content:Buffer};
const limit=5*1024*1024;
export function validateMedia(value:unknown):Media {
  if (!value || typeof value!=="object" || !("base64" in value) || typeof value.base64!=="string" ||
      value.base64.length>Math.ceil(limit/3)*4 || !("filename" in value) || typeof value.filename!=="string")
    throw new Error("Invalid attachment");
  const content=Buffer.from(value.base64,"base64");
  if (!content.length || content.length>limit || content.toString("base64")!==value.base64) throw new Error("Invalid attachment data");
  const signatures=[
    ["89504e470d0a1a0a","image/png","png"],["ffd8ff","image/jpeg","jpg"],
    ["255044462d","application/pdf","pdf"],["4f676753","audio/ogg","ogg"],
  ];
  let format=signatures.find(([hex])=>content.subarray(0,hex.length/2).toString("hex")===hex);
  if (!format && content.toString("ascii",4,8)==="ftyp" &&
      ["isom","iso2","mp41","mp42","avc1"].includes(content.toString("ascii",8,12))) format=["","video/mp4","mp4"];
  if (!format) throw new Error("Use PNG, JPEG, PDF, Ogg audio or MP4 video");
  const filename=value.filename.replace(/\.[^.]+$/,"").replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,80) || "attachment";
  return {filename:filename+"."+format[2],mime:format[1],content};
}
export function messageContent(body:string, media:Media|null):AnyMessageContent {
  if (!media) return {text:body};
  if (media.mime.startsWith("image/")) return {image:media.content,caption:body,mimetype:media.mime};
  if (media.mime.startsWith("video/")) return {video:media.content,caption:body,mimetype:media.mime};
  if (media.mime.startsWith("audio/")) return {audio:media.content,mimetype:media.mime};
  return {document:media.content,fileName:media.filename,caption:body,mimetype:media.mime};
}
