const validationUtility = (type, input) => {
  const output = { isValid: true };
  switch (type) {
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        output.isValid = false;
        output.message = "Please provide a valid email address.";
      }
      break;

    case "password":
      const hasCapital = /[A-Z]/.test(input);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(input);
      const hasSpace = /\s/.test(input);

      if (input.length < 8 || !hasCapital || !hasSymbol || hasSpace) {
        output.isValid = false;
        output.message =
          "Password needs 8+ chars, a capital letter, a symbol, and no spaces.";
      }
      break;

    case "name":
      if (input.trim().length < 3) {
        output.isValid = false;
        output.message = "Name must be at least 3 characters long.";
      }
      break;

    case "bio":
      if (input.trim().length < 64) {
        output.isValid = false;
        output.message = "bio must be at least 64 characters long.";
      }
      if (input.trim().length > 264) {
        output.isValid = false;
        output.message = "bio cant be more than 264 characters long.";
      }
      break;

    case "skills":
      if (input.length < 3) {
        output.isValid = false;
        output.message = "the skills array must be at least three skills long";
      } else {
        for (let i of input) {
          if (i.trim().length < 3) {
            output.isValid = false;
            output.message = "a skill must be at least 3 characters long.";
          }
        }
      }

      break;
    case "description":
      if (input.trim().length < 64) {
        output.isValid = false;
        output.message = "description must be at least 64 characters long.";
      }
      if (input.trim().length > 500) {
        output.isValid = false;
        output.message = "description cant be more than 500 characters long.";
      }
      break;
    case "title":
      if (input.trim().length < 20) {
        output.isValid = false;
        output.message = "title must be at least 20 characters long.";
      }
      if (input.trim().length > 100) {
        output.isValid = false;
        output.message = "title cant be more than 100 characters long.";
      }
      break;
    case "budget":
      if (isNaN(input) || input <= 0) {
        output.isValid = false;
        output.message = "budget must be bigger than 0.";
      }

      break;

    default:
      return { message: "the type must be either: email, password or name" };
  }

  return output;
};

module.exports = validationUtility;
