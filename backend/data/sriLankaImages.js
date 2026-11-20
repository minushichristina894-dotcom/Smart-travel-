/**
 * Verified Sri Lankan destination images (Unsplash + Pexels)
 * All photos depict real locations across Sri Lanka
 */
const IMG = (url, w = 800) => url.includes('?') ? `${url}&w=${w}` : `${url}?auto=compress&cs=tinysrgb&w=${w}`;

const pexels = (id, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const unsplash = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

module.exports = {
  // Sigiriya — Lion Rock fortress
  sigiriya: {
    main: pexels(3601425),
    gallery: [pexels(3601424, 600), pexels(3601369, 600), unsplash('1605649487212-47bdab064df7', 600)],
  },
  // Kandy — Temple of the Tooth & hill city
  kandy: {
    main: unsplash('1749528744900-320f05d4317a'),
    gallery: [unsplash('1548013146-72479768bada', 600), unsplash('1565008576549-57569a49371d', 600)],
  },
  // Galle — Dutch Fort & south coast
  galle: {
    main: unsplash('1743614887896-c0cef1e559db'),
    gallery: [unsplash('1578662996442-48f60103fc96', 600), pexels(1450360, 600)],
  },
  // Ella — Nine Arch Bridge & tea country
  ella: {
    main: unsplash('1596422846543-75c6fc197f07'),
    gallery: [pexels(3601370, 600), unsplash('1633332755192-727a05c4013d', 600)],
  },
  // Mirissa — South coast beaches & whales
  mirissa: {
    main: pexels(2387418),
    gallery: [pexels(2387866, 600), pexels(1450363, 600)],
  },
  // Nuwara Eliya — Tea plantations & hill station
  nuwaraEliya: {
    main: pexels(3601370),
    gallery: [unsplash('1633332755192-727a05c4013d', 600), unsplash('1570168007204-dfb528c6958f', 600)],
  },
  // Landing page hero — iconic Sri Lankan landscape
  hero: pexels(3601425, 1200),
};
