exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw('create extension if not exists "uuid-ossp"'),
    knex.schema.createTable('users', function(table){
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.string('email').unique().notNullable();
      table.string('password');
      table.string('type');
      table.integer('priority');
      table.timestamps(true, true);
      table.boolean('confirmed');
      table.string('confirmationToken');
      table.string('recoveryToken');
      table.string('pendingEmail').unique();
      table.string('pendingEmailConfirmationToken');
      table.string('referralID');
      table.string('referralName');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('users')
  ]);
};
