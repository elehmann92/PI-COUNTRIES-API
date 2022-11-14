const axios = require("axios");
const { Op } = require("sequelize");
const { Country, Activity } = require("../db");

const TOLERANCE = 15; // days of tolerance for country database antiquity
const ENTRIES = 250; // amount of entries that country database should have in order to be complete

async function getDbCountries(exclude) {
  return await Country.findAll({
    attributes: { exclude },
  });
}

async function getFullDb(exclude) {
  return await Country.findAll({
    attributes: { exclude },
    include: {
      model: Activity,
      attributes: {
        exclude,
      },
      through: {
        attributes: [],
      },
    },
  });
}

async function getCountryById(id, exclude) {
  const country = await Country.findByPk(id, {
    attributes: { exclude },
    include: {
      model: Activity,
      attributes: { exclude },
      through: {
        attributes: [],
      },
    },
  });

  // // I choose to return an empty array in case of no match, ir order to have an easier way to filter from front.
  // if (!country) {
  //   throw new Error(
  //     "ID not corresponding to any Country. Make sure to provide an ISO 3166-1 alpha-3 format code"
  //   );
  // }

  return country;
}

async function searchByQuery(name, exclude) {
  const result = await Country.findAll({
    where: {
      name: {
        [Op.iLike]: "%" + name + "%",
      },
    },
    include: {
      model: Activity,
      attributes: { exclude },
      through: {
        attributes: [],
      },
    },
    attributes: { exclude },
  });

  // if (result.length === 0) {
  //   throw new Error(
  //     "No country name matches the provided string. Try with another search."
  //   );
  // }

  return result;
}

async function updateDb() {
  let restCountries = await axios.get("https://restcountries.com/v3/all");
  await restCountries.data.map(async (country) => {
    const defaults = {
      name: country.name.common,
      flag: country.flags[0],
      continent: country.continents[0],
      capital: country.capital ? country.capital[0] : "Capital Undefined",
      subregion: country.subregion || "Subregion Undefined",
      area: country.area,
      population: country.population,
    };
    const [result, created] = await Country.findOrCreate({
      where: {
        id: country.cca3,
      },
      defaults,
    });
    // console.log(result.toJSON(), created)
    // if (!created) {
    //   result.set(defaults);
    //   await result.save();
    // }
  });
}

function YYYYMMDD(date) {
  const stringDate = JSON.stringify(date).slice(1, 11);
  return Number(stringDate.replaceAll("-", ""));
}

async function dbAntiquity() {
  const firstCountry = await Country.findOne();
  if (!firstCountry) return false;

  const dbDate = firstCountry.toJSON().updatedAt;
  return YYYYMMDD(new Date()) - YYYYMMDD(dbDate);
}

async function updateIfNeeded() {
  const antiquity = await dbAntiquity();
  if (antiquity === false || antiquity > TOLERANCE) await updateDb();
}

function activityBodyIsValid(name, difficulty, duration, season, countries) {
  if (!name || !countries.length || !difficulty || !duration || !season) {
    console.log(name, countries, difficulty, duration, season);
    throw new Error(
      "Name, difficulty, duration, season and countries are required fields"
    );
  }
  const upSeason = season.toUpperCase();
  const validSeasons = ["SUMMER", "WINTER", "SPRING", "FALL", "ANY"];
  if (!validSeasons.includes(upSeason)) {
    throw new Error(
      "Season must be equal to one of these values: Summer, Winter, Spring, Fall or Any"
    );
  }

  return true;
}

module.exports = {
  getDbCountries,
  getFullDb,
  searchByQuery,
  getCountryById,
  updateIfNeeded,
  activityBodyIsValid,
};
