const { Router } = require('express');

const {
  getPackages,
  addPackage,
  deletePackage,
  changePackageName,
  changeDeliveredStatus,
  changeNotificationStatus,
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

router.get('/change-package-name', async (req, res, next) => {
  try {
    const data = await changePackageName(
      req.context.userId, req.context.packageNumber, req.query,
    );
    res.send({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/change-delivered-status', async (req, res, next) => {
  try {
    const data = await changeDeliveredStatus(
      req.context.userId,
      req.context.packageNumber,
    );
    res.send({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/change-notification-status/:status', async (req, res, next) => {
  try {
    const data = await changeNotificationStatus(
      req.context.userId,
      req.context.packageNumber,
      req.params.status,
    );
    res.send({ data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
