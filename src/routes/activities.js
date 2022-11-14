const { Router } = require("express");
const { Op } = require("sequelize");
const { Activity, Country } = require("../db");
const { activityBodyIsValid } = require("../handlers/dbControl");
const router = Router();

router.post("/", async (req, res) => {
  const name = req.body.name?.toUpperCase();
  const { difficulty, duration, season, countries = [] } = req.body;
  try {
    activityBodyIsValid(name, difficulty, duration, season, countries);

    const [activity, created] = await Activity.findOrCreate({
      where: {
        name,
      },
      defaults: {
        difficulty,
        duration,
        season,
      },
    });

    const dbCountries = await Country.findAll({
      where: {
        name: countries,
      },
    });

    await activity.addCountries(dbCountries);

    if (!created) {
      activity.set({
        difficulty: difficulty,
        duration: duration,
        season: season,
      });
      await activity.save();
      return res
        .status(200)
        .json({ message: "Activity already existed. Info updated" });
    }

    res.status(200).json({
      message:
        "Activity created successfully and assigned to respective countries",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const activities = await Activity.findAll({
      order: ["id"],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    res.json(activities);
  } catch (error) {
    res.status(404).json([]);
  }
});

router.get("/names", async (req, res) => {
  try {
    const activityNames = await Activity.findAll({
      attributes: ["name"],
      order: ["name"],
    });
    res.json(activityNames.map((obj) => obj.name));
  } catch (error) {
    res.status(404).json([]);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const activityToDestroy = await Activity.findByPk(id);

    if (!activityToDestroy) throw new Error("ID not found");
    const activityName = activityToDestroy.toJSON().name;
    await activityToDestroy.destroy();
    res
      .status(200)
      .json(`ID ${id} (${activityName}) was found and succesfully deleted`);
  } catch (error) {
    res.status(404).json(error.message);
  }
});

router.delete("/deleteFromCountry/:actId/:countryId", async (req, res) => {
  try {
    const { actId } = req.params;
    const countryId = req.params.countryId?.toUpperCase();

    if (!actId || !countryId) throw new Error("Missing fields");

    const actToRemoveFrom = await Activity.findByPk(actId);
    if (!actToRemoveFrom) throw new Error("Activity not found");

    const countryToRemove = await Country.findByPk(countryId);
    if (!countryToRemove) throw new Error("Country not found");

    const result = await actToRemoveFrom.removeCountry(countryToRemove);

    if (!result)
      throw new Error(`${countryId} wasn't registrered to activity ${actId}`);

    res.json(
      `${countryId} successfully disassociated from activity ${actId}`
    );
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
