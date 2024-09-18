const oryApiUrl = process.env.ORY_API_URL

/* ====== */
/* Signup */
/* ====== */
const signupForm = document.getElementById("signupForm")
const errorMessageDiv = document.getElementById("errorMessage")
const successMessageDiv = document.getElementById("successMessage")

async function createRegistrationFlow() {
  try {
    const response = await fetch(
      `${oryApiUrl}/self-service/registration/browser`,
      {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        credentials: "include"
      }
    )

    if (response.ok) {
      const data = await response.json()
      return { flowId: data.id, csrfToken: data.ui.nodes[0].attributes.value } // This is the flow ID we need to submit the registration form
    } else {
      throw new Error("Failed to create registration flow")
    }
  } catch (error) {
    errorMessageDiv.textContent = error.message
  }
}

async function submitRegistration(flowId, csrfToken, email, password) {
  try {
    const response = await fetch(
      `${oryApiUrl}/self-service/registration?flow=${flowId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          csrf_token: csrfToken,
          method: "password",
          traits: {
            email: email,
            role: "user"
          },
          password: password
        })
      }
    )

    console.log({ response })

    if (response.ok) {
      successMessageDiv.textContent =
        "Sign-up successful! Please check your email for confirmation."
      errorMessageDiv.textContent = ""
    } else {
      const errorData = await response.json()
      console.log({ errorData })
      errorMessageDiv.textContent = errorData.error.message || "Sign-up failed!"
      successMessageDiv.textContent = ""
    }
  } catch (error) {
    errorMessageDiv.textContent = error.message
    successMessageDiv.textContent = ""
  }
}

signupForm.addEventListener("submit", async function (event) {
  event.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  if (email && password) {
    console.log({ email, password })

    // 1. Create the registration flow
    const { flowId, csrfToken } = await createRegistrationFlow()

    if (flowId && csrfToken) {
      console.log({ flowId, csrfToken })
      // 2. Submit the registration form with the flow ID
      await submitRegistration(flowId, csrfToken, email, password)
    }
  } else {
    errorMessageDiv.textContent = "Please fill in all fields."
    successMessageDiv.textContent = ""
  }
})

/* ===== */
/* LOGIN */
/* ===== */
const loginForm = document.getElementById("loginForm")
const loginErrorMessageDiv = document.getElementById("loginErrorMessage")
const loginSuccessMessageDiv = document.getElementById("loginSuccessMessage")

async function initializeLoginFlow() {
  try {
    const response = await fetch(
      `${oryApiUrl}/self-service/login/browser?refresh=true`,
      {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        credentials: "include"
      }
    )

    if (!response.ok) {
      throw new Error("Failed to initialize login flow")
    }

    const data = await response.json()

    const csrfToken = data.ui.nodes.find(
      (node) => node.attributes.name === "csrf_token"
    ).attributes.value
    return { flowId: data.id, csrfToken: csrfToken }
  } catch (error) {
    console.log(error)
    console.error("Error:", error.message)
  }
}

async function submitLogin(flowId, csrfToken, email, password) {
  try {
    const response = await fetch(
      `${oryApiUrl}/self-service/login?flow=${flowId}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          csrf_token: csrfToken,
          method: "password",
          identifier: email,
          password: password
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Login failed:", errorData.error.message)
    } else {
      console.log("Login successful!")
      const loginData = await response.json()
      console.log({ loginData })
      // You can store the session token or handle post-login actions here
    }
  } catch (error) {
    console.error("Error:", error.message)
  }
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  if (email && password) {
    // 1. Create the Login flow
    const { flowId, csrfToken } = await initializeLoginFlow()

    if (flowId && csrfToken) {
      console.log({ flowId, csrfToken })
      // 2. Submit the login form with the flow ID
      await submitLogin(flowId, csrfToken, email, password)
    }
  } else {
    errorMessageDiv.textContent = "Please fill in all fields."
    successMessageDiv.textContent = ""
  }
})

/* ======================= */
/* CHECK IF USER LOGGED IN */
/* ======================= */
async function checkSession() {
  try {
    const response = await fetch(`${oryApiUrl}/sessions/whoami`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      credentials: "include"
    })

    if (response.ok) {
      const sessionData = await response.json()

      const loginHeading = document.getElementById("login-heading")

      loginHeading.textContent = `Logged in as: ${sessionData.identity.traits.role}`
    } else {
      console.log("User is not logged in")
    }
  } catch (error) {
    console.error("Error checking session:", error.message)
  }
}

checkSession()

/* ================ */
/* CALL BACKEND API */
/* ================ */

const usrBtn = document.getElementById("user-profile-btn")

usrBtn.addEventListener("click", async () => {
  const response = await fetch(`http://localhost:3000/user-profile`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    credentials: "include"
  })

  const data = await response.json()
  console.log({ data })
})

// TODO:
/*
- Create Logout flow. If the user is logged in show the log out button.
- On Succesful login change the text of heading.
- Handle user and admin signup.
- Implement authorisation for user and admin on backend.
*/
