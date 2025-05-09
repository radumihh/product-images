const fs = require("fs");
const path = require("path");

const rootDir = "./general";
const githubRawBaseURL = "https://raw.githubusercontent.com/radumihh/product-images/main/general";

// 1. Citește JSON-ul existent (dacă există)
let existingProducts = [];
let maxId = 0;
try {
  if (fs.existsSync("productss.json")) {
    const existingContent = fs.readFileSync("productss.json", "utf8");
    existingProducts = JSON.parse(existingContent);
    maxId = existingProducts.reduce((max, p) => Math.max(max, p.id || 0), 0);
  }
} catch (err) {
  console.error("❌ Eroare la citirea productss.json:", err);
}

// 2. Construiește un set de imgURLs existente
const existingImgURLs = new Set(existingProducts.flatMap(p => p.imgURLs || []));

// 3. Citește toate subfolderele
const parentFolders = fs.readdirSync(rootDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory());

let newProducts = [];

for (const parent of parentFolders) {
  const parentPath = path.join(rootDir, parent.name);

  // Verificăm dacă există imagini direct în folderul părinte
  const parentImageFiles = fs.readdirSync(parentPath)
    .filter(file => /\.(jpe?g|png|webp)$/i.test(file));

  if (parentImageFiles.length > 0) {
    const imgURLs = parentImageFiles.map(file =>
      `${githubRawBaseURL}/${encodeURIComponent(parent.name)}/${encodeURIComponent(file)}`
    );

    const sourceImages = parentImageFiles.map(file =>
      `${file}`
    );

    if (!existingImgURLs.has(imgURLs[0])) {
      maxId++;
      newProducts.push({
        id: maxId,
        nume: `Product ${maxId}`,
        pret: "0",
        materiale: "",
        "info-aditional": "",
        sourceImages: sourceImages,
        culoare: "",
        product_code: `PROD${maxId.toString().padStart(6, '0')}`,
        imgURLs: imgURLs,
        main_image_url: imgURLs[0]
      });
    }
  }

  // Verificăm subfolderele din folderul părinte
  const childFolders = fs.readdirSync(parentPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  for (const child of childFolders) {
    const imageFolderPath = path.join(parentPath, child.name);

    const imageFiles = fs.readdirSync(imageFolderPath)
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file));

    if (imageFiles.length === 0) continue;

    const imgURLs = imageFiles.map(file =>
      `${githubRawBaseURL}/${encodeURIComponent(parent.name)}/${encodeURIComponent(child.name)}/${encodeURIComponent(file)}`
    );

    const sourceImages = imageFiles.map(file =>
      `${child.name}\\${file}`
    );

    if (!existingImgURLs.has(imgURLs[0])) {
      maxId++;
      newProducts.push({
        id: maxId,
        nume: `Product ${maxId}`,
        pret: "0",
        materiale: "",
        "info-aditional": "",
        sourceImages: sourceImages,
        culoare: "",
        product_code: `PROD${maxId.toString().padStart(6, '0')}`,
        imgURLs: imgURLs,
        main_image_url: imgURLs[0]
      });
    }
  }
}

// 4. Scrie în JSON: produse vechi + cele noi
const updatedProducts = [...existingProducts, ...newProducts];
fs.writeFileSync("productss.json", JSON.stringify(updatedProducts, null, 2), "utf8");

console.log(`✅ Adăugat ${newProducts.length} produse noi. Total: ${updatedProducts.length}`);
