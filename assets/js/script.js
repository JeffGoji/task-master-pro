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

  //jQuery date picker:
  $("#modalDueDate").datepicker({
    minDate: 1,
  });
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

//List group:
$(".list-group").on("click", "p", function () {
  //get current text:
  var text = $(this).text().trim();

  //Create new input element:
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

//Adding jQuery Date Picker to editable notes:
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this).text().trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function () {
      //When the calender is closed, force a change even on the 'dateInput'
      $(this).trigger("change");
    },
  });

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

//Changed "Blur" to "change" callback when the date picker was added:
$(".list-group").on("change", "textarea", function () {
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

//Due Date editing:
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
$(".list-group").on("change", "input[type='text']", function () {
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

//Drag and drop task elements are being told to create and move a copy instead of an original.
//This is necessary to prevent click events from accidentally triggering on the original element.
//Also added several event listners: activate, over, and out.
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event) {
    console.log("deactivate", this);
  },
  over: function (event) {
    console.log("over", event.target);
  },
  out: function (event) {
    console.log("update", this);
  },

  update: function (event) {
    //Array to store the task data in:
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this)
      .children()

      .each(function () {
        var text = $(this).find("p").text().trim();

        var date = $(this).find("span").text().trim();

        //Add task data to the temp array as an object:
        tempArr.push({
          text: text,
          date: date,
        });
      });
    // Trim down list's ID to match object property
    var arrName = $(this).attr("id").replace("list-", "");

    // Update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
});

//Draggable droppable Trash option for LI items to Trash bin on bottom of screen:
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function (evet, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function (event, ui) {
    console.log("over");
  },
  out: function (event, ui) {
    console.log("out");
  },
});

//Did not add Moment.js due to obsolescence with program. Will add JS timer in the 2.0 build.
