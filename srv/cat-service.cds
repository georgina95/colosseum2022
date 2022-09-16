using my.todoapp as my from '../db/data-model';



service CatalogService @(path:'/browse') {

  /** For displaying lists of Tasks */
  @readonly entity ListOfTasks as projection on Tasks;
  
  @readonly entity Tasks as projection on my.Tasks { *
  };
}