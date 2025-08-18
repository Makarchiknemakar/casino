const body = document.body;
const btnLight = document.querySelector(".btn-light");
const btnDark = document.querySelector(".btn-dark");


const savedTheme = localStorage.getItem("theme") || "light";
body.classList.add(savedTheme);


function setLightTheme() {
  body.classList.remove("dark");
  body.classList.add("light");
  body.style.backgroundColor = "azure";
  body.style.color = "black";
  localStorage.setItem("theme", "light");
}

function setDarkTheme() {
  body.classList.remove("light");
  body.classList.add("dark");
  body.style.backgroundColor = "#121212";
  body.style.color = "white";
  localStorage.setItem("theme", "dark");
}


btnLight.addEventListener("click", setLightTheme);
btnDark.addEventListener("click", setDarkTheme);


if (savedTheme === "dark") {
  setDarkTheme();
} else {
  setLightTheme();
}
