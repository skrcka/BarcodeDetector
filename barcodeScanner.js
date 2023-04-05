const barcodeReaderBody = document.getElementById('barcodeReaderBody');
const video = document.getElementById("codeModalVideo");
const canvas = document.getElementById("codeModalCanvas");
const context = canvas.getContext("2d");
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayContext = overlayCanvas.getContext('2d');
let scanning = false;

async function startVideo(id) {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: "environment" },
		});
		video.srcObject = stream;
		video.addEventListener("loadedmetadata", async () => {
			video.play();
			updateCanvasSizeAndDrawing();
			await scanBarcode(id);
		});
	} catch (err) {
		console.error("Error accessing camera: ", err);
	}
}

async function scanBarcode(id) {
	if (!scanning) return;

	const barcodeDetector = new BarcodeDetector({ formats: ["itf", "code_128"] });

	try {
		context.drawImage(video, 0, 0, canvas.width, canvas.height);
		const barcodes = await barcodeDetector.detect(canvas);

		if (barcodes.length > 0) {
			barcodes.forEach((barcode) => {
				$(`#${id}`).val(barcode.rawValue);
				$("#scanModal").modal("hide");
				stop();
			});
		}
	} catch (err) {
		console.error("Error scanning barcode: ", err);
	}

	requestAnimationFrame(() => scanBarcode(id));
}

function stop() {
	scanning = false;
	const stream = video.srcObject;
	const tracks = stream.getTracks();
	tracks.forEach((track) => {
		track.stop();
	});
	video.srcObject = null;
}

$("#codeModalClose").on("click", function (e) {
	e.preventDefault();
	$("#scanModal").modal("hide");
	stop();
});

$("#scanModal").on("hidden.bs.modal", function () {
	stop();
});

function openCodeScanner(id) {
	if (!("BarcodeDetector" in window)) {
		//alert("Tento prohlížeč/zařízení nepodporuje detekci čárových kódů.");
		//return;
	}
	startVideo(id);
	$("#scanModal").modal("show");
	scanning = true;
}

function updateCanvasSizeAndDrawing() {
	const containerWidth = barcodeReaderBody.clientWidth;
	const containerHeight = barcodeReaderBody.clientHeight;
  
	canvas.width = containerWidth;
	canvas.height = containerHeight;
	overlayCanvas.width = containerWidth;
	overlayCanvas.height = containerHeight;
  
	const barcodeX = containerWidth * 0.1;
	const barcodeY = containerHeight * 0.5;
	const barcodeWidth = containerWidth - containerWidth * 0.2;
	console.log(barcodeX, barcodeY, barcodeWidth);
  
	// Draw the red line for reading
	context.clearRect(0, 0, canvas.width, canvas.height);
	overlayContext.strokeStyle = "red";
	overlayContext.lineWidth = 3;
	overlayContext.beginPath();
	overlayContext.moveTo(barcodeX, barcodeY);
	overlayContext.lineTo(barcodeX + barcodeWidth, barcodeY);
	overlayContext.stroke();
  }

window.addEventListener('resize', updateCanvasSizeAndDrawing);

$(document).ready(function () {
	updateCanvasSizeAndDrawing();
});
