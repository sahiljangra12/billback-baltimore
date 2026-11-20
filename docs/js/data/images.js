// Photos used on the site: all openly licensed on Wikimedia Commons.
// CC0 / public domain need no credit, but we credit everyone anyway.
// CC BY / CC BY-SA require the credit and license link shown on the About page.

const C = "https://upload.wikimedia.org/wikipedia/commons";

export const IMAGES = {
  rowhousesEast: {
    src: `${C}/thumb/7/7a/Rowhouses%2C_2126-2134_E._Baltimore_Street%2C_Baltimore%2C_MD_21231_%2847560835961%29.jpg/1920px-Rowhouses%2C_2126-2134_E._Baltimore_Street%2C_Baltimore%2C_MD_21231_%2847560835961%29.jpg`,
    alt: "Brick rowhouses on East Baltimore Street",
    title: "Rowhouses, 2126–2134 E. Baltimore Street",
    author: "Baltimore Heritage",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    page: "https://commons.wikimedia.org/wiki/File:Rowhouses,_2126-2134_E._Baltimore_Street,_Baltimore,_MD_21231_(47560835961).jpg",
  },
  harbor: {
    src: `${C}/thumb/b/b0/A_panoramic_view_of_the_Baltimore_Inner_Harbor.jpg/1920px-A_panoramic_view_of_the_Baltimore_Inner_Harbor.jpg`,
    alt: "Panoramic view of Baltimore's Inner Harbor and skyline",
    title: "A panoramic view of the Baltimore Inner Harbor",
    author: "Bruce Emmerling",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    page: "https://commons.wikimedia.org/wiki/File:A_panoramic_view_of_the_Baltimore_Inner_Harbor.jpg",
  },
  rowhousesStreet: {
    src: `${C}/thumb/6/6e/Baltimore_Rowhouses_%2827091356438%29.jpg/1280px-Baltimore_Rowhouses_%2827091356438%29.jpg`,
    alt: "A Baltimore street lined with rowhouses",
    title: "Baltimore Rowhouses",
    author: "Baltimore Heritage",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    page: "https://commons.wikimedia.org/wiki/File:Baltimore_Rowhouses_(27091356438).jpg",
  },
  northAvenue: {
    src: `${C}/thumb/8/82/Rowhouses%2C_West_North_Avenue%2C_Baltimore%2C_MD_%2833199682691%29.jpg/1280px-Rowhouses%2C_West_North_Avenue%2C_Baltimore%2C_MD_%2833199682691%29.jpg`,
    alt: "Rowhouses on West North Avenue",
    title: "Rowhouses, West North Avenue",
    author: "Baltimore Heritage",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    page: "https://commons.wikimedia.org/wiki/File:Rowhouses,_West_North_Avenue,_Baltimore,_MD_(33199682691).jpg",
  },
  waterMeter: {
    src: `${C}/thumb/c/cc/Itron_Water_Meter.jpg/960px-Itron_Water_Meter.jpg`,
    alt: "A residential water meter dial",
    title: "Itron Water Meter",
    author: "Ganesh Dhamodkar",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    page: "https://commons.wikimedia.org/wiki/File:Itron_Water_Meter.jpg",
  },
  electricMeter: {
    src: `${C}/b/b7/Vorarlberger_Kraftwerke-Energy_meter_%28electro%29-09ASD_crop.jpg`,
    alt: "An electricity meter showing kilowatt-hours",
    title: "Energy meter (electro)",
    author: "Asurnipal",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    page: "https://commons.wikimedia.org/wiki/File:Vorarlberger_Kraftwerke-Energy_meter_(electro)-09ASD_crop.jpg",
  },
  towTruck: {
    src: `${C}/a/a7/Tow_truck_-_I-65.jpg`,
    alt: "A tow truck on the roadside",
    title: "Tow truck – I-65",
    author: "Daniel Ziegler",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    page: "https://commons.wikimedia.org/wiki/File:Tow_truck_-_I-65.jpg",
  },
};

/** Fill <img data-img="key"> and [data-bg="key"] elements, and add a credit line. */
export function hydrateImages(root = document) {
  root.querySelectorAll("img[data-img]").forEach((img) => {
    const m = IMAGES[img.dataset.img];
    if (!m) return;
    img.src = m.src;
    img.alt = img.alt || m.alt;
    img.loading = img.loading || "lazy";
    img.decoding = "async";
  });
  root.querySelectorAll("[data-bg]").forEach((el) => {
    const m = IMAGES[el.dataset.bg];
    if (!m) return;
    el.style.setProperty("--bg-img", `url("${m.src}")`);
    if (!el.querySelector(".photo-credit")) {
      const c = document.createElement("a");
      c.className = "photo-credit";
      c.href = m.page;
      c.target = "_blank";
      c.rel = "noopener";
      c.textContent = `Photo: ${m.author} · ${m.license}`;
      el.append(c);
    }
  });
}
