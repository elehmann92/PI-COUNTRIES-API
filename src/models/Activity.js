const { DataTypes, Model, Op } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.

class Activity extends Model {}

module.exports = (sequelize) => {
  // defino el modelo
  return Activity.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        set(value) {
          this.setDataValue("name", value.toUpperCase());
        },
      },
      difficulty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          max: 5,
          min: 1,
        },
      },
      duration: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0.5,
          max: 100,
        },
      },
      season: {
        type: DataTypes.STRING(10),
        allowNull: false,
        set(value) {
          if (value) {
            this.setDataValue("season", value.toUpperCase());
          }
        },
      },
    },
    {
      sequelize,
      modelName: "Activity",
    }
  );
};
