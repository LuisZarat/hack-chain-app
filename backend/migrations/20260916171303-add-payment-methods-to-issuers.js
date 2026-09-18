'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('issuers', 'payment_methods', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('issuers', 'payment_methods');
  }
};
