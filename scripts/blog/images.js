function cloudinary(url, width = 1200) {
  if (!url || !/^https?:\/\/res\.cloudinary\.com\//i.test(url)) return url;
  if (/\/upload\/(?:[^/]+,)*f_(?:auto|jpg)/i.test(url) || /\/upload\/so_/i.test(url)) {
    return url.replace(/\/upload\//, `/upload/f_auto,q_auto:eco,w_${width},c_limit/`);
  }
  return url.replace('/upload/', `/upload/f_auto,q_auto:eco,w_${width},c_limit/`);
}

module.exports = {
  cloudinary,
  falseCeiling: cloudinary('https://res.cloudinary.com/u9nzf2zz/image/upload/v1792677519/IMG_6655.JPG.jpg'),
  modularKitchen: cloudinary('https://res.cloudinary.com/u9nzf2zz/image/upload/v1792679172/IMG_4372.JPG.jpg'),
  luxuryTv: cloudinary('https://res.cloudinary.com/u9nzf2zz/image/upload/v1791545735/WhatsApp_Image_2026-10-09_at_4.28.34_PM_1.jpg'),
  dressing: cloudinary('https://res.cloudinary.com/u9nzf2zz/image/upload/v1792677061/IMG_5747.JPG.jpg'),
  entrance: cloudinary('https://res.cloudinary.com/u9nzf2zz/image/upload/v1791545737/WhatsApp_Image_2026-10-09_at_4.28.35_PM_2.jpg'),
  mandir: cloudinary('https://res.cloudinary.com/u9nzf2zz/video/upload/so_1/v1791545764/WhatsApp_Video_2026-10-09_at_4.28.38_PM_2.jpg'),
  study: cloudinary('https://res.cloudinary.com/u9nzf2zz/video/upload/so_1/v1791545760/WhatsApp_Video_2026-10-09_at_4.28.37_PM.jpg'),
  featureWall: cloudinary('https://res.cloudinary.com/u9nzf2zz/video/upload/so_1/v1791545815/WhatsApp_Video_2026-10-09_at_4.28.32_PM.jpg'),
  floorTile: '/images/floor-tile.jpg',
  almira: '/images/almira.jpg',
  bathroom: '/images/bathroom.jpg'
};
