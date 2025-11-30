export const isEmail = (email: string) => {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
};

export const isPasswordStrong = (password: string) => password.length >= 6;
