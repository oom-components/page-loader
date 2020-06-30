/**
 * Function to download a resource
 */
export default function download(url, filename) {
  let response;

  return fetch(url)
    .then((res) => {
      if (res.status != 200) {
        throw new Error(`The request status code is ${res.status}`);
      }

      response = res;
      return res.blob();
    })
    .then((blob) => {
      const href = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.dataset.loader = "off";
      a.download = getFilename(response) || filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(href);
    });
}

function getFilename(response) {
  const header = response.headers.get("Content-Disposition");

  if (!header) {
    return false;
  }

  const matches = header.match(/filename="?([^";]+)/);

  return matches ? matches[1] : false;
}
