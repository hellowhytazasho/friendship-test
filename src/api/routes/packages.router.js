const { Router } = require('express');

const {
  getPackages,
  addPackage,
  deletePackage,
} = require('../../services/packages.service');

const router = Router();

router.get('/packages/:userId', async (req, res, next) => {
  try {
    const data = await getPackages(req.params.userId);
    res.send({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/package', async (req, res, next) => {
  try {
    const data = await addPackage(req.body);
    res.send({ data });
  } catch (error) {
    next(error);
  }
});

router.delete('/package/:userId/:trackNumber', async (req, res, next) => {
  try {
    const data = await deletePackage(req.params.userId, req.params.trackNumber);
    res.send({ data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
