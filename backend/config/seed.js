const Project = require('../models/Project');
const Studio = require('../models/Studio');
const { CONTENT_VERSION, projects, studio } = require('../data/site');

async function seed() {
  const current = await Studio.findOne().select('contentVersion').lean();
  const projectCount = await Project.countDocuments();
  if (current && current.contentVersion === CONTENT_VERSION && projectCount > 0) {
    return;
  }

  await Project.deleteMany({});
  await Studio.deleteMany({});
  await Project.insertMany(projects);
  await Studio.create(studio);
  console.log(`Seeded Interior Lord content (${projects.length} spaces)`);
}

module.exports = seed;
