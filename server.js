const fs = require("fs");
const path = require("path");

const rootDir = "./general"; // Folosește folderul general pentru produsele tale
const githubRawBaseURL = "https://raw.githubusercontent.com/radumihh/product-images/main/general"; // URL-ul RAW GitHub
let result = [];
let counter = 1;

// Citește toate subfolderele din general
const productFolders = fs.readdirSync(rootDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory());

for (const folder of productFolders) {
  const folderName = folder.name;
  const fullFolderPath = path.join(rootDir, folderName);

  // info.json
  const infoPath = path.join(fullFolderPath, "info.json");
  let infoData = {};

  if (fs.existsSync(infoPath)) {
    try {
      const infoContent = fs.readFileSync(infoPath, "utf8");
      infoData = JSON.parse(infoContent);
    } catch (err) {
      console.error(`❌ Eroare la citirea/parsing info.json în ${folderName}`);
    }
  }

  // Subfolder de imagini
  const subdirs = fs.readdirSync(fullFolderPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  let imgURLs = [];

  if (subdirs.length > 0) {
    const imageFolderName = subdirs[0].name; // Numele subfolderului de imagini
    const imageFolderPath = path.join(fullFolderPath, imageFolderName);
    const imageFiles = fs.readdirSync(imageFolderPath)
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file)); // Filtrează doar fișierele de imagini

    imgURLs = imageFiles.map(file =>
      `${githubRawBaseURL}/${encodeURIComponent(folderName)}/${encodeURIComponent(imageFolderName)}/${encodeURIComponent(file)}`
    );
  }

  // Adaugă produsul în rezultat
  result.push({
    id: counter,
    ...infoData,
    imgURLs,
    main_image_url: imgURLs[0] || ""
  });

  counter++;
}

// Scrie în productss.json
fs.writeFileSync("productss.json", JSON.stringify(result, null, 2));
console.log("✅ productss.json generat cu succes!");
