const registerName = document.querySelector("#registerName");
const registerEmail = document.querySelector("#registerEmail");
const registerPassword = document.querySelector("#registerPassword");
const registerBtn = document.querySelector("#registerBtn");

const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginBtn = document.querySelector("#loginBtn");

const responseBox = document.querySelector("#responseBox");

registerBtn.addEventListener(
  "click",
  () => (responseBox.textContent = "Register button clicked"),
);
