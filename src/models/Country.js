const { DataTypes, Model, Op } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.

class Country extends Model {}

module.exports = (sequelize) => {
  // defino el modelo
  return Country.init(
    {
      id: {
        type: DataTypes.STRING(3),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      flag: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      continent: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      capital: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subregion: { type: DataTypes.STRING },
      area: { type: DataTypes.INTEGER },
      population: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "Country",
    }
  );
};
