var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: [],
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate,
    });

    saveTasks();
  }
});

//NEw Code for 5.1.6
$(".list-group").on("click", "p", function () {
  var text = $(this).text().trim();
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

//5.1.6 - Blur callback:
$(".list-group").on("blur", "textarea", function () {
  //Get the text area's current value:
  var text = $(this).val().trim();

  //Get the parrent UL's id attribute:
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements:
  var index = $(this).closest(".list-group-item").index();

  //Task variables:
  tasks[status][index].text = text;
  saveTasks();

  //Recreate p element
  var taskP = $("<p>").addClass("m-1").text(text);

  //Replace text area with p element:
  $(this).replaceWith(taskP);
});

//5.1.7 = Due Date editing:
//due date was clicked:
$(".list-group").on("click", "span", function () {
  //Get the current text:
  var date = $(this).text().trim();

  //Create new input element:
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  //Swap out elements:
  $(this).replaceWith(dateInput);

  //Automatically focus on new element
  dateInput.trigger("focus");
});

//Blur event to convert everything back when user clicks outside of input fields:
//Value of due date was changed:
$(".list-group").on("blur", "input[type= 'text']", function () {
  // Get current text"
  var date = $(this).val().trim();

  // Get the parent UL's id attribute:
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  //Get the task's position in the list of other LI elements:
  var index = $(this).closest(".list-group-item").index();

  //Update the task array and re-save to local storage:
  tasks[status][index].date = date;
  saveTasks();

  //Recreate the span element with bootstrap classes:
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  //Replace the input with a Span element:
  $(this).replaceWith(taskSpan);
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();
