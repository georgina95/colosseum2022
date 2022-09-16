const cds = require('@sap/cds')

class CatalogService extends cds.ApplicationService { init(){

  const { Tasks } = this.entities ('my.todoapp')
  return super.init()
}}

module.exports = { CatalogService }