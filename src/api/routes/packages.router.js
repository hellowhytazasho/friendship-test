const { Router } = require('express');

const {
  getPackages,
  addPackage,
  deletePackage,
} = require('../../services/packages.service');

const router = Router();

router.get('/packages', async (req, res, next) => {
  try {
    const data = await getPackages(req.context.userId);
    res.send({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/add-package', async (req, res, next) => {
  try {
    const data = await addPackage(req.context.userId, req.query);
    res.send({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/delete-package', async (req, res, next) => {
  try {
    const data = await deletePackage(
      req.context.userId, req.context.packageNumber,
    );
    res.send({ data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
