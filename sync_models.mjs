import { readdir, symlink } from "fs/promises";
import { extname, join } from "path";

import config from "./sync_models.config.json" assert { type: "json" };

async function listFilesWithExtensions(directoryPath, extensions) {
  try {
    const files = await readdir(directoryPath);
    const filteredFiles = files.filter((file) => {
      const fileExt = extname(file);
      return extensions.includes(fileExt.slice(1)); // Remove the dot from the extension
    });
    return filteredFiles;
  } catch (err) {
    console.error("Error reading directory:", err);
    throw err;
  }
}

async function makeLinkForFiles(fromPath, extensions, toPath) {
  try {
    const files = await listFilesWithExtensions(fromPath, extensions);
    for (const file of files) {
      const sourcePath = join(fromPath, file);
      const targetPath = join(toPath, file);

      try {
        await symlink(sourcePath, targetPath);
        console.log(`Created symlink for ${file}`);
      } catch (err) {
        if (err.code === "EEXIST") {
          console.log(`Skipping ${file}: Symlink already exists`);
        } else {
          console.error(`Error creating symlink for ${file}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

// Get command line arguments
// const [
//   _,
//   __,
//   directoryPath = "Q:/ML/sd/models",
//   targetDir = ".",
//   ...extensions
// ] = process.argv;

try {
  const { items } = config;
  for (const { extensions, from, to } of items) {
    for (const f of from) {
      for (const t of to) {
        makeLinkForFiles(f, extensions, t);
      }
    }
  }
} catch (e) {
  console.err("Ooops");
  console.err(e);
}

// makeLinkForFiles(
//   directoryPath,
//   extensions.length > 0 ? extensions : ["safetensors"],
//   targetDir
// );
