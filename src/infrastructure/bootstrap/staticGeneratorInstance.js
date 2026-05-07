const StaticGenerator = require('../static/staticGenerator');

const GetPage = require('../../domain/content/application/GetPage');
const ListPages = require('../../domain/content/application/ListPages');
const CreatePage = require('../../domain/content/application/CreatePage');
const GetSettings = require('../../domain/settings/application/GetSettings');

const pageRepository = require('../../domain/content/infrastructure/pageRepository');
const blockRepository = require('../../domain/content/infrastructure/blockRepository');
const settingsRepository = require('../../domain/settings/infrastructure/settingsRepository');

const transactionManager = require('../database/transactionManager');

const getPage = new GetPage(pageRepository, blockRepository);
const listPages = new ListPages(pageRepository);
const getSettings = new GetSettings(settingsRepository);

const staticGenerator = new StaticGenerator(
  getPage,
  listPages,
  getSettings,
  null,
  pageRepository
);

const createPage = new CreatePage(
  pageRepository,
  blockRepository,
  staticGenerator,
  transactionManager
);

staticGenerator.createPage = createPage;

module.exports = staticGenerator;
