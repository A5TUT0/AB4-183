document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login");
  const bruteForceButton = document.getElementById("bruteForce");
  const resultText = document.getElementById("result");
  const postsButton = document.getElementById("posts");
  let storedToken = "";
  const login = async (username, password) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json(); // Asume que la respuesta es JSON
    if (result.token) {
      storedToken = result.token; // Guarda el token
      console.log("Token received:", storedToken);
    }
    resultText.insertAdjacentHTML("afterbegin", JSON.stringify(result));
  };
  const posts = async () => {
    if (!storedToken) {
      console.error("No token available. Please log in first.");
      return;
    }
    const response = await fetch("/api/post", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
    });
    const result = await response.text();
    resultText.insertAdjacentHTML("afterbegin", result);
  };

  postsButton.addEventListener("click", async () => {
    await posts();
    console.log("NICE");
  });
  loginButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    await login(username, password);
  });

  bruteForceButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    while (true) {
      await login(username, password);
    }
  });
});
