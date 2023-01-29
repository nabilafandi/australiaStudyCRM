
const customerList = document.querySelector('.list-group');
const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const referenceInput = document.querySelector('#reference');
const statusInput = document.querySelector('#status');
const progressSelect = document.querySelector('#progress-select');
const updateButton = document.querySelector('#update-button');
const addButton = document.querySelector('#add-button');
const deleteButton = document.querySelector('#delete-button');
const commentList = document.querySelector('#listcomment');
const customerHeader = document.querySelector('#name-header');
var datePicker = document.getElementById("date-picker");



//set datepicker value to today
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
datePicker.value = today;



let activeCustomer;


function fetchCustomers() {
  fetch('/customers')
    .then(response => response.json())
    .then(customers => {

      customerList.innerHTML = '';
      customers.forEach(customer => {
        const customerItem = document.createElement('a');
        customerItem.classList.add('list-group-item', 'list-group-item-action', 'py-3', 'lh-tight');
        customerItem.innerHTML = `
          <div class="d-flex w-100 align-items-center justify-content-between">
            <strong class="mb-1">${customer.firstName} ${customer.lastName}</strong>
            <small class="text-muted">${customer.progress}</small>
          </div>
        `;

        customerItem.addEventListener('click', () => {
          activeCustomer = customer;
          customerHeader.textContent = `${customer.firstName} ${customer.lastName}`
          firstNameInput.value = customer.firstName;
          lastNameInput.value = customer.lastName;
          referenceInput.value = customer.reference;
          statusInput.value = customer.status;
          progressSelect.value = customer.progress;
          //comments
          function fetchComments() {

            fetch(`/customers/${customer._id}/comments`)
              .then(response => response.json())
              .then(comments => {
                commentList.innerHTML = '';
                var commentContainer = document.querySelector(".card-body");
                comments.sort((b, a) => {
                  return new Date(a.time) - new Date(b.time);
                }).forEach(comment => {
                  const commentList = document.createElement('div');
                  commentList.classList.add('single-comment');
                  commentList.innerHTML = `
      <div class="card p-3 w-105" style="position: relative;">
      <div class="d-flex justify-content-between align-items-center">
      <div class="user d-flex flex-row align-items-center">
      <span> <small class="font-weight-bold"> ${comment.body}</small> </span>
      </div>
      </div>
      <a href="#" class="date-text">
      <small style="float: right;">${comment.time}</small>
      </a>
      <small class="btn" style="text-align: right; position: absolute; top: 0 ; right: 0;"></small>
      </div>
      <li class="list-inline-item">
      <button type="button" class="btn btn-link" id="comment-edit">Edit</button>
      <button type="button" class="btn btn-link" id="comment-delete">Delete</button>
      <li class="list-inline-item">
              `;
                  var editBtn = commentList.querySelector(".btn-link:first-child");
                  var deleteBtn = commentList.querySelector(".btn-link:last-child");
                  var dateText = commentList.querySelector(".date-text small");
                  // add event listeners for the Edit delete and date buttons
                  editBtn.addEventListener("click", function() {
                    // code to edit the comment goes here
                    var newText = prompt("Enter new text for the comment:");
                    if (newText && newText.length === 0) {
                      alert("Comment cannot be empty.")
                    }
                    else if (newText) {
                      editedComment = {
                        body: newText
                      }
                      fetch(`/customers/${activeCustomer._id}/comments/${comment._id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editedComment)
                      })
                        .then(response => response.json())
                        .then(() => {
                          var commentText = commentList.querySelector(".font-weight-bold");
                          commentText.innerHTML = newText;
                        });
                    }
                  });
                  deleteBtn.addEventListener("click", function() {
                    // code to delete the comment goes here
                    var confirmDelete = confirm("Are you sure you want to delete this comment?");
                    if (confirmDelete) {
                      fetch(`/customers/${activeCustomer._id}/comments/${comment._id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                      })
                      commentList.remove();
                    }
                  });
                  dateText.addEventListener("click", function() {
                    var newDate = prompt("Enter new date (yyyy-mm-dd):");
                    if (newDate) {
                      editedDate = {
                        time: newDate
                      }
                      fetch(`/customers/${activeCustomer._id}/comments/${comment._id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editedDate)
                      })
                      fetchComments()
                    }
                  });
                  //append commentlist
                  commentContainer.appendChild(commentList);
                });
              })
          }

          fetchComments()
          //deselect active
          customerList.querySelectorAll('.list-group-item').forEach(item => {
            item.classList.remove('active');
          });
          customerItem.classList.add('active');
        });
        customerList.appendChild(customerItem);
      });

    });

}
//submit comment
document.getElementById("submit-button").addEventListener("click", function() {
  newComment = {
    time: document.getElementById("date-picker").value,
    body: document.getElementById("textAreaExample2").value,
  }
  fetch(`/customers/${activeCustomer._id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newComment)
  })
    .then(response => response.json())
    .then(() => {
      function refetchComments() {

        fetch(`/customers/${activeCustomer._id}/comments`)
          .then(response => response.json())
          .then(comments => {
            commentList.innerHTML = '';
            var commentContainer = document.querySelector(".card-body");
            comments.sort((b, a) => {
              return new Date(a.time) - new Date(b.time);
            }).forEach(comment => {
              const commentList = document.createElement('div');
              commentList.classList.add('single-comment');
              commentList.innerHTML = `
  <div class="card p-3 w-105" style="position: relative;">
  <div class="d-flex justify-content-between align-items-center">
  <div class="user d-flex flex-row align-items-center">
  <span> <small class="font-weight-bold"> ${comment.body}</small> </span>
  </div>
  </div>
  <a href="#" class="date-text">
  <small style="float: right;">${comment.time}</small>
  </a>
  <small class="btn" style="text-align: right; position: absolute; top: 0 ; right: 0;"></small>
  </div>
  <li class="list-inline-item">
  <button type="button" class="btn btn-link" id="comment-edit">Edit</button>
  <button type="button" class="btn btn-link" id="comment-delete">Delete</button>
  <li class="list-inline-item">
          `;
              var editBtn = commentList.querySelector(".btn-link:first-child");
              var deleteBtn = commentList.querySelector(".btn-link:last-child");
              var dateText = commentList.querySelector(".date-text small");
              // add event listeners for the Edit delete and date buttons
              editBtn.addEventListener("click", function() {
                // code to edit the comment goes here
                var newText = prompt("Enter new text for the comment:");
                if (newText && newText.length === 0) {
                  alert("Comment cannot be empty.")
                }
                else if (newText) {
                  editedComment = {
                    body: newText
                  }
                  fetch(`/customers/${activeCustomer._id}/comments/${comment._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editedComment)
                  })
                    .then(response => response.json())
                    .then(() => {
                      var commentText = commentList.querySelector(".font-weight-bold");
                      commentText.innerHTML = newText;
                    });
                }
              });
              deleteBtn.addEventListener("click", function() {
                // code to delete the comment goes here
                var confirmDelete = confirm("Are you sure you want to delete this comment?");
                if (confirmDelete) {
                  fetch(`/customers/${activeCustomer._id}/comments/${comment._id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                  })
                  commentList.remove();
                }
              });
              dateText.addEventListener("click", function() {
                var newDate = prompt("Enter new date (yyyy-mm-dd):");
                if (newDate) {
                  editedDate = {
                    time: newDate
                  }
                  fetch(`/customers/${activeCustomer._id}/comments/${comment._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editedDate)
                  })
                  refetchComments()
                }
              });
              //append commentlist
              commentContainer.appendChild(commentList);
            });
          })
      }
      refetchComments()
    })
})
updateButton.addEventListener('click', () => {
  if (!activeCustomer) return;
  const updatedCustomer = {
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
    reference: referenceInput.value,
    status: statusInput.value,
    progress: progressSelect.value
  };
  fetch(`/customers/${activeCustomer._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCustomer)
  })
    .then(response => response.json())
    .then(() => {
      fetchCustomers();
      activeCustomer = null;
    });
});

deleteButton.addEventListener('click', () => {
  if (!activeCustomer) return;
  fetch(`/customers/${activeCustomer._id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(response => response.json())
    .then(() => {
      fetchCustomers();
      activeCustomer = null;
    });
});

addButton.addEventListener('click', () => {
  const updatedCustomer = {
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
    reference: referenceInput.value,
    status: statusInput.value,
    progress: progressSelect.value
  };
  fetch(`/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCustomer)
  })
    .then(response => response.json())
    .then(() => {
      fetchCustomers();
      activeCustomer = null;
    });
});


fetchCustomers();



// Search functionality
const searchInput = document.querySelector("input[type='search']");
searchInput.addEventListener("input", function() {
  const searchTerm = this.value.toLowerCase();
  const listItems = document.querySelectorAll(".list-group-item");
  listItems.forEach(function(item) {
    const name = item.querySelector("strong").textContent.toLowerCase();
    if (name.includes(searchTerm)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
});

// Progress search functionality
const progressSearch = document.querySelector("#progress-search");
progressSearch.addEventListener("change", function() {
  const selectedProgress = this.value;
  const listItems = document.querySelectorAll(".list-group-item");
  listItems.forEach(function(item) {
    const progress = item.querySelector("small").textContent;
    if (progress === selectedProgress || selectedProgress === "Select Progress") {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
});
