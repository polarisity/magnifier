// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer } = require("electron");

var mouseX = 0;
var mouseY = 0;

ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  var stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 3840,
          minHeight: 720,
          maxHeight: 2160,
        },
      },
    });
    // console.log(stream);
    // console.log(
    //   "resolution:",
    //   stream.getVideoTracks()[0].getSettings().width,
    //   stream.getVideoTracks()[0].getSettings().height
    // );
  } catch (e) {
    handleError(e);
  }

  const processor = new MediaStreamTrackProcessor(stream.getVideoTracks()[0]);
  const reader = processor.readable.getReader();
  readChunk();

  function readChunk() {
    reader.read().then(({ done, value }) => {
      canvas.width = 600;
      canvas.height = 400;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let mx = mouseX - 300;
      let my = mouseY - 200;
      // value is a VideoFrame
      if (mouseX - 300 <= 0) mx = 0;
      else if (mouseX - 300 > 1439) mx = 1439;
      if (mouseY - 200 <= 0) my = 0;
      else if (mouseY - 200 > 759) my = 759;
      ctx.drawImage(
        value,
        (sx = 2 * mx), // (0 - 3839)
        (sy = 2 * my), // (0-2159)
        (sw = 600),
        (sh = 400),
        (dx = 0),
        (dy = 0),
        (dw = 600),
        (dh = 400)
      );
      value.close(); // close the VideoFrame when we're done with it
      if (!done) {
        readChunk();
      }
    });
  }
});

ipcRenderer.on("MOUSE_POS", async (event, mousePos) => {
  console.log(mousePos);
  mouseX = mousePos.x;
  mouseY = mousePos.y;
});

function handleError(e) {
  console.log(e);
}
