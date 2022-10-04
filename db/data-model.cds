namespace my.todoapp;

entity Tasks {
  key ID : Integer;
  title  : String;
  description : String;
  duedate : Date;
  status: Boolean;
}