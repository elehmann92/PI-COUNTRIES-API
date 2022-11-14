const { Router } = require("express");
const { Country } = require("../db");
const {
  getFullDb,
  getCountryById,
  searchByQuery,
} = require("../handlers/dbControl");

const router = Router();

router.get("/", async (req, res) => {
  const { name } = req.query;
  try {
    if (name) {
      const queryResult = await searchByQuery(name, ["createdAt", "updatedAt"]);
      return res.json(queryResult);
    }

    const fullDb = await getFullDb(["createdAt", "updatedAt"]);
    res.json(fullDb);
  } catch (error) {
    res.status(404).json(error.message);
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id.toUpperCase();
  try {
    const country = await getCountryById(id, ["createdAt", "updatedAt"]);
    res.json(country.toJSON());
  } catch (error) {
    res.status(404).json(null);
  }
});

router.put("/ATF", async (req, res) => {
  const atf = await Country.findByPk("ATF");
  atf.set({
    name: "French Southern and Antarctic Lands",
    flag: "https://flagcdn.com/tf.svg",
    continent: "Antarctica",
    capital: "Port-aux-Français",
    subregion: "Subregion Undefined",
    area: 500,
    population: 10,
  });
  await atf.save()
  res.json('success')
});

module.exports = router;
