using my.todoapp as my from '../db/data-model';



service CatalogService @(path:'/browse') {
	@cds.localized: false

  /** For displaying lists of Tasks */
  @readonly entity ListOfTasks as projection on Tasks;
  
  entity Tasks as projection on my.Tasks { *
  };
}