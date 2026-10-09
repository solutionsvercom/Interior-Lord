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
        video: project.video || ''
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
