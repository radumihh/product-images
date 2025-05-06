// const fs = require("fs");
// const path = require("path");

// const rootDir = "./general"; 
// const githubRawBaseURL = "https://raw.githubusercontent.com/radumihh/product-images/main/general";
// let result = [];
// let counter = 1;

// // Citește toate subfolderele din general
// const productFolders = fs.readdirSync(rootDir, { withFileTypes: true })
//   .filter(dirent => dirent.isDirectory());

// for (const folder of productFolders) {
//   const folderName = folder.name;
//   const fullFolderPath = path.join(rootDir, folderName);
  
//   // info.json
//   const infoPath = path.join(fullFolderPath, "info.json");
//   let infoData = {};
  
//   if (fs.existsSync(infoPath)) {
//     try {
//       const infoContent = fs.readFileSync(infoPath, "utf8");
//       infoData = JSON.parse(infoContent);
//     } catch (err) {
//       console.error(`❌ Eroare la citirea/parsing info.json în ${folderName}`);
//     }
//   }
  
//   // Subfolder de imagini
//   const subdirs = fs.readdirSync(fullFolderPath, { withFileTypes: true })
//     .filter(dirent => dirent.isDirectory());
  
//   let imgURLs = [];
//   let sourceImages = [];
//   let hasImages = false;
  
//   if (subdirs.length > 0) {
//     // Procesare subfoldere cu imagini
//     for (const subdir of subdirs) {
//       const imageFolderName = subdir.name;
//       const imageFolderPath = path.join(fullFolderPath, imageFolderName);
      
//       try {
//         const imageFiles = fs.readdirSync(imageFolderPath)
//           .filter(file => /\.(jpe?g|png|webp)$/i.test(file));
        
//         if (imageFiles.length > 0) {
//           hasImages = true;
          
//           // Adăugăm calea relativă pentru sourceImages
//           const folderSourceImages = imageFiles.map(file => 
//             `${imageFolderName}\\${file}`
//           );
//           sourceImages = [...sourceImages, ...folderSourceImages];
          
//           // Adăugăm URL-urile complete pentru imgURLs
//           const folderImgURLs = imageFiles.map(file =>
//             `${githubRawBaseURL}/${encodeURIComponent(folderName)}/${encodeURIComponent(imageFolderName)}/${encodeURIComponent(file)}`
//           );
//           imgURLs = [...imgURLs, ...folderImgURLs];
//         }
//       } catch (err) {
//         console.error(`❌ Eroare la citirea imaginilor din ${imageFolderName}`, err);
//       }
//     }
//   } else {
//     // Verificăm dacă există imagini direct în folderul principal (fără subfolder)
//     try {
//       const imageFiles = fs.readdirSync(fullFolderPath)
//         .filter(file => /\.(jpe?g|png|webp)$/i.test(file));
      
//       if (imageFiles.length > 0) {
//         hasImages = true;
        
//         // Adăugăm calea relativă pentru sourceImages
//         sourceImages = imageFiles;
        
//         // Adăugăm URL-urile complete pentru imgURLs
//         imgURLs = imageFiles.map(file =>
//           `${githubRawBaseURL}/${encodeURIComponent(folderName)}/${encodeURIComponent(file)}`
//         );
//       }
//     } catch (err) {
//       console.error(`❌ Eroare la citirea imaginilor din folderul principal ${folderName}`, err);
//     }
//   }
  
//   // Adaugă produsul în rezultat doar dacă are imagini sau info.json
//   if (hasImages || Object.keys(infoData).length > 0) {
//     // Generate default values for missing fields
//     const defaultProductName = `Product ${counter}`;
//     const defaultPrice = "0";
//     const defaultMaterials = "";
//     const defaultColor = "";
//     const defaultProductCode = `PROD${counter.toString().padStart(6, '0')}`;
    
//     result.push({
//       id: counter,
//       nume: infoData.nume || defaultProductName,
//       pret: infoData.pret || defaultPrice,
//       materiale: infoData.materiale || defaultMaterials,
//       "info-aditional": infoData["info-aditional"] || "",
//       sourceImages: sourceImages,
//       culoare: infoData.culoare || defaultColor,
//       product_code: infoData.product_code || defaultProductCode,
//       imgURLs: imgURLs,
//       main_image_url: imgURLs.length > 0 ? imgURLs[0] : ""
//     });
    
//     counter++;
//   }
// }

// // Scrie în products.json
// fs.writeFileSync("productss.json", JSON.stringify(result, null, 2));
// console.log("✅ products.json generat cu succes!");


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
