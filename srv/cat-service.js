const cds = require('@sap/cds')

class CatalogService extends cds.ApplicationService { init(){

  const { Tasks } = this.entities ('my.todoapp')

  this.after('READ', Tasks.Tasks, each => {
    each.title += ` -- Boo`
  })

  return super.init()
}}

module.exports = { CatalogService }