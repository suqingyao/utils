/**
 * 邮箱格式正则表达式
 */
export const emailReg = /^[a-zA-Z0-9_]+@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/;

/**
 * 手机号格式正则表达式
 */
export const phoneReg = /^1[3-9]\d{9}$/;

/**
 * 密码格式正则表达式
 */
export const passwordReg = /^[a-zA-Z0-9_]{6,16}$/;

/**
 * 身份证格式正则表达式
 */
export const idCardReg = /^\d{17}[\dXx]|\d{15}$/;

/**
 * 验证邮箱是否符合格式
 * @param email 要验证的邮箱
 * @returns 是否符合格式
 */
export const isValidEmail = (email: string) => emailReg.test(email);

/**
 * 验证手机号是否符合格式
 * @param phone 要验证的手机号
 * @returns 是否符合格式
 */
export const isValidPhone = (phone: string) => phoneReg.test(phone);

/**
 * 验证密码是否符合格式
 * @param password 要验证的密码
 * @returns 是否符合格式
 */
export const isValidPassword = (password: string) => passwordReg.test(password);

/**
 * 验证身份证是否符合格式
 * @param idCard 要验证的身份证
 * @returns 是否符合格式
 */
export const isValidIdCard = (idCard: string) => idCardReg.test(idCard);
