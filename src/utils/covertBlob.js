export const convertBlobURL = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn(error);
  }
};
