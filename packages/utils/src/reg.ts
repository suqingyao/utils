/**
 * 邮箱格式正则表达式
 */
export const emailReg: RegExp = /^\w+@\w+(\.\w+)+$/;

/**
 * 手机号格式正则表达式
 */
export const phoneReg: RegExp = /^1[3-9]\d{9}$/;

/**
 * 密码格式正则表达式
 */
export const passwordReg: RegExp = /^\w{6,16}$/;

/**
 * 身份证格式正则表达式
 */
export const idCardReg: RegExp = /^\d{17}[\dX]|\d{15}$/i;

/**
 * 验证邮箱是否符合格式
 * @param email 要验证的邮箱
 * @returns 是否符合格式
 */
export const isValidEmail = (email: string): boolean => emailReg.test(email);

/**
 * 验证手机号是否符合格式
 * @param phone 要验证的手机号
 * @returns 是否符合格式
 */
export const isValidPhone = (phone: string): boolean => phoneReg.test(phone);

/**
 * 验证密码是否符合格式
 * @param password 要验证的密码
 * @returns 是否符合格式
 */
export const isValidPassword = (password: string): boolean => passwordReg.test(password);

/**
 * 验证身份证是否符合格式
 * @param idCard 要验证的身份证
 * @returns 是否符合格式
 */
export const isValidIdCard = (idCard: string): boolean => idCardReg.test(idCard);
