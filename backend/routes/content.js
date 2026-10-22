const express = require('express');
const Project = require('../models/Project');
const Studio = require('../models/Studio');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [studio, projects] = await Promise.all([
      Studio.findOne().lean(),
      Project.find().sort({ order: 1 }).lean()
    ]);

    res.json({
      studio,
      projects: projects.map((project) => ({
        id: String(project._id),
        order: project.order,
        number: project.number,
        title: project.title,
        category: project.category,
        year: project.year,
        image: project.image,
        images: Array.isArray(project.images) ? project.images : [],
        video: project.video || '',
        show: Array.isArray(project.show)
          ? project.show
            .filter((item) => item && item.src)
            .map((item) => ({
              kind: item.kind === 'video' ? 'video' : 'image',
              src: item.src
            }))
          : []
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
