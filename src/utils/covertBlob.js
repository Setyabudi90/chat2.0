export const convertBlobURL = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
