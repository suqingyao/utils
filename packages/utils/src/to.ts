export async function to<T>(
  promise: Readonly<Promise<T>>,
  errorExt?: object,
) {
  try {
    const data = await promise;
    return [null, data];
  }
  catch (err) {
    if (errorExt) {
      return Object.assign({}, err, errorExt);
    }
    return [err, undefined];
  }
}
