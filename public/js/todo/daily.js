const apiDateURL = `/api${window.location.pathname}`; // get, post, deleteAll
const apiIndivURL = (id) => `/api/todo/${id}`; // put, patch, delete
console.log(apiDateURL);
const todoForm = document.forms.todoForm;
const todoList = document.querySelector("ul#todoList");
const clearBtn = document.getElementById("clear");

todoForm.addEventListener("submit", addTodo);
clearBtn.addEventListener("click", clearTodoList);
initTodo();

async function initTodo() {
  // 서버에서 투두리스트를 가져와서 화면에 렌더링
  const todos = await (await fetch(apiDateURL)).json();
  todos.forEach(({ id, checked, content }) => appendTodo(id, checked, content));
}

async function removeTodo(e) {
  // 투두 ID 추출
  const todo = e.target.closest("li");
  const id = Number(todo.id);
  try {
    // 서버에서 투두 삭제
    const res = await deleteTodo(id);
    if (!res.ok) throw new Error(res.status);
    // 화면에서 투두 삭제
    todoList.removeChild(todo);
    console.log("투두리스트가 성공적으로 삭제되었습니다.");
  } catch (error) {
    console.error("투두리스트 삭제 중 오류가 발생했습니다.", error);
  }
}

async function deleteTodo(id) {
  // 서버에서 투두 삭제
  try {
    const res = await fetch(apiIndivURL(id), { method: "DELETE" });
    if (!res.ok) throw new Error(res.status);
    return res;
  } catch {
    console.error("투두리스트 삭제 중 오류가 발생했습니다.", error);
  }
}

async function clearTodoList(e) {
  // 서버에서 투두리스트 전체 삭제
  try {
    const res = await fetch(apiDateURL, { method: "DELETE" });
    if (!res.ok) throw new Error(res.status);
    Array.from(todoList.children).forEach((child) => child.remove());
  } catch (error) {
    console.error("투두리스트 전체 삭제 중 오류가 발생했습니다.", error);
  }
}

async function addTodo(e) {
  e.preventDefault();
  const todo = todoForm.todo.value;
  try {
    if (todo !== "") {
      // 투두리스트를 서버에 저장 후 아이디 값 수신
      const { id, checked } = await postTodo(todo);
      // 화면에 투두리스트 추가
      appendTodo(id, checked, todo);
    }
    todoForm.reset();
  } catch (error) {
    console.error("투두리스트 추가 중 오류가 발생했습니다.", error);
  }
}

// 투두리스트 수정
async function editTodo(e) {
  const todo = e.target.closest("li");
  const id = Number(todo.id);
  const label = todo.querySelector("label");
  const previousValue = label.textContent;
  const newValue = prompt("수정할 내용을 입력하세요", previousValue);

  try {
    if (newValue !== null) {
      // 서버에서 투두 수정
      const res = await updateTodo(id, newValue);
      if (!res.ok) throw new Error(res.status);
      // 화면에서 투두 수정
      label.textContent = newValue;
      console.log("수정이 완료되었습니다.");
    }
  } catch (error) {
    console.error("수정 실패:", error);
  }
}

// 서버에 투두리스트 업데이트
async function updateTodo(id, newValue) {
  try {
    const res = await fetch(apiIndivURL(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newValue }),
    });

    if (!res.ok) {
      throw new Error(res.status);
    }

    return res;
  } catch (error) {
    console.error("서버 데이터 업데이트 실패:", error);
  }
}

// HTML 코드에서 코멘트를 추가하는 함수
async function sendComment(todoId) {
  console.log(todoId);
  const commentInput = document.querySelector(`#toggle${todoId}`);
  const commentText = commentInput.value;

  if (commentText === "") {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  try {
    const res = await fetch(`/api/todo/comment/${todoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: commentText,
        todo_id: todoId,
        emotion_id: 1,
      }),
    });
    console.log(res);

    // 댓글을 표시하는 엘리먼트 찾기
    const commentContainer = commentInput.closest(".comment-container");
    // 댓글 내용을 담는 엘리먼트 생성
    const commentTextElement = document.createElement("div");
    commentTextElement.textContent = commentText;
    // commentContainer.appendChild(commentTextElement);
    window.location.reload();
    // 댓글 작성 후, 댓글 필드 초기화
    commentInput.value = "";
  } catch (error) {
    console.error("댓글 작성 실패:", error);
  }
}
// HTML 코드에서 코멘트를 가져오는 함수
async function appendTodo(id, checked, value) {
  const li = document.createElement("li");
  li.id = id;
  let contentHTML = `
    <input type="checkbox" id="${id}check" ${checked ? "checked" : ""}>
    <label for="${id}check">${value}</label>
    <button class="edit">Edit</button>
    <button class="delete">x</button>
    <button type="button" class="comment">comment<img src="/public/images/comment.png" width="25px" height="25px"/></button>
  `;

  const comment = await getComment(id);
  if (comment && comment.content) {
    contentHTML += `
      <div class="comment-container">${comment.content}</div>
      <button type="button" class="comment-edit">Edit</button>
      <button type="button" class="comment-delete">x</button>
    `;
  } else {
    contentHTML += `
      <li class="comment-container" >
        <textarea type="text" class="toggle" id="toggle${id}" rows="1" placeholder="댓글 작성" oninput="calcTextareaHeight(this)"></textarea>
        <button type="button" class="comment_submit" onclick="sendComment(${id})">작성</button>
        <input type="hidden" class="comment-edit"></input>
        <input type="hidden" class="comment-delete"></input>
      </li>
    `;
  }

  li.innerHTML = contentHTML;
  li.style.fontFamily = "ImcreSoojin";
  li.querySelector('input[type="checkbox"]').addEventListener(
    "change",
    toggleTodo
  );
  //todoList 이벤트
  li.querySelector(".edit").addEventListener("click", editTodo);
  li.querySelector(".delete").addEventListener("click", removeTodo);
  li.querySelector(".comment").addEventListener("click", commentToggle);
  //comment 이벤트
  li.querySelector(".comment-edit").addEventListener("click", editComment);
  li.querySelector(".comment-delete").addEventListener("click", removeComment);

  todoList.appendChild(li);
  document.querySelector("section").style.display = "block";
}

//서버에서 comment를 가져오는 함수
async function getComment(todoId) {
  try {
    const res = await fetch(`/api/todo/comment/${todoId}`);
    const comments = await res.json();
    return comments;
  } catch (error) {
    console.error("댓글 가져오기 실패:", error);
  }
}

//comment를 수정하는 함수
async function editComment(e) {
  const todo = e.target.closest("li");
  const id = Number(todo.id);
  const comment = todo.querySelector(".comment-container");
  const previousValue = comment.textContent;
  const newValue = prompt("수정할 내용을 입력하세요", previousValue);

  try {
    if (newValue !== null) {
      // 서버에서 투두 수정
      const res = await updateComment(id, newValue);
      if (!res.ok) throw new Error(res.status);
      // 화면에서 투두 수정
      comment.textContent = newValue;
    }
  } catch (error) {
    console.error("수정 실패:", error);
  }
}

//서버에서 comment를 수정하는 함수
async function updateComment(todoId, newValue) {
  try {
    const res = await fetch(`/api/todo/comment/${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newValue }),
    });
    return res;
  } catch (error) {
    console.error("댓글 수정 실패:", error);
  }
}

// comment를 삭제하는 함수
async function removeComment(e) {
  const todo = e.target.closest("li");
  const id = Number(todo.id);
  try {
    // 서버에서 투두 삭제
    const res = await deleteComment(id);
    if (!res.ok) throw new Error(res.status);
    // 화면에서 투두 삭제
    todo.querySelector(".comment-container").remove();
    todo.querySelector(".comment-edit").remove();
    todo.querySelector(".comment-delete").remove();
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
  }
}

//서버에서 comment를 삭제하는 함수
async function deleteComment(todoId) {
  try {
    const res = await fetch(`/api/todo/comment/${todoId}`, {
      method: "DELETE",
    });
    return res;
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
  }
}

async function calcTextareaHeight(e) {
  e.style.height = "auto";
  e.style.height = `${e.scrollHeight}px`;
}

//지금 작동이 안됌 내일 수정해야함.
async function commentToggle(e) {
  const todo = e.target.closest("li");
  const cmt = todo.querySelector(".toggle");

  if (window.getComputedStyle(cmt).display === "none") {
    console.log(window.getComputedStyle(cmt).display);
    cmt.style.display = "block";
  } else {
    cmt.style.display = "none";
  }
}

async function toggleTodo(e) {
  const todo = e.target.closest("li");
  const id = Number(todo.id);
  const checked = e.target.checked;
  try {
    const res = await fetch(apiIndivURL(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked }),
    });
    if (!res.ok) throw new Error(res.status);
    console.log("투두리스트가 성공적으로 수정되었습니다.");
  } catch (error) {
    console.error("투두리스트 수정 중 오류가 발생했습니다.", error);
  }
}

async function postTodo(content) {
  try {
    const res = await fetch(apiDateURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error(res.status);
    const { id, checked } = await res.json();
    console.log("투두리스트가 성공적으로 저장되었습니다.");
    return { id, checked };
  } catch (error) {
    console.error("투두리스트 저장 중 오류가 발생했습니다.", error);
  }
}
