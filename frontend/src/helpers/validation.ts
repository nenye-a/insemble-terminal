const VALID_EMAIL_REG = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const NUMBER_REG = /^[1-9][0-9]*$/;

export function validateEmail(email: string) {
  return VALID_EMAIL_REG.test(email);
}

export function validateNumber(field: string) {
  return NUMBER_REG.test(field);
}
