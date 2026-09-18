'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('class_requests', 'payment_method', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    await queryInterface.addColumn('class_requests', 'payment_provider', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('class_requests', 'payment_method');
    await queryInterface.removeColumn('class_requests', 'payment_provider');
  }
};
