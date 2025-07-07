const targetAspectRatio = 16 / 9;
const MAX_DIMENSION = 2048;

const initImageConverter = () => {
    const imageInput = document.getElementById('imageInput');
    const fileNameSpan = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const imagePreview = document.getElementById('imagePreview');
    const downloadLink = document.getElementById('downloadLink');
    const resolutionInfo = document.getElementById('resolutionInfo');
    const sizeInfo = document.getElementById('sizeInfo');

    const watermarkImageInput = document.getElementById('watermarkImageInput');
    const watermarkFileNameSpan = document.getElementById('watermarkFileName');
    const removeWatermarkBtn = document.getElementById('removeWatermarkBtn');

    let selectedFile = null;
    let watermarkFile = null;
    let selectedWatermarkPosition = 'top-right'; // Default position

    // Initialize watermark position buttons
    document.querySelectorAll('.watermark-position-selector .pos-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.watermark-position-selector .pos-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedWatermarkPosition = this.dataset.position;
        });
    });
    // Set default active button
    document.querySelector('.watermark-position-selector .pos-btn.top-right').classList.add('active');

    imageInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        const p = imagePreview.querySelector('p');
        if (selectedFile) {
            fileNameSpan.textContent = selectedFile.name;
            if(p) p.textContent = getTranslation('imageConverter.readyMessage');
            downloadLink.style.display = 'none';
            resolutionInfo.textContent = '';
            sizeInfo.textContent = '';
        } else {
            fileNameSpan.textContent = getTranslation('imageConverter.noFileSelected');
        }
    });

    watermarkImageInput.addEventListener('change', (e) => {
        watermarkFile = e.target.files[0];
        if (watermarkFile) {
            watermarkFileNameSpan.textContent = watermarkFile.name;
            removeWatermarkBtn.style.display = 'inline-block';
        } else {
            watermarkFileNameSpan.textContent = getTranslation('watermark.noFileSelected');
            removeWatermarkBtn.style.display = 'none';
        }
    });

    removeWatermarkBtn.addEventListener('click', () => {
        watermarkFile = null;
        watermarkImageInput.value = ''; // Clear the file input
        watermarkFileNameSpan.textContent = getTranslation('watermark.noFileSelected');
        removeWatermarkBtn.style.display = 'none';
    });

    convertBtn.addEventListener('click', () => {
        if (!selectedFile) {
            alert(getTranslation('imageConverter.errorMessage'));
            return;
        }
        const optimization = document.querySelector('input[name="optimization"]:checked').value;
        const watermarkTransparency = document.querySelector('input[name="watermark-transparency"]:checked').value;

        processImage(selectedFile, optimization, watermarkFile, selectedWatermarkPosition, watermarkTransparency);
    });

    function processImage(file, optimization, watermarkFile = null, watermarkPosition = null, watermarkTransparency = null) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let originalWidth = img.width;
                let originalHeight = img.height;

                // Scale image so that its largest dimension is MAX_DIMENSION (2048px)
                const currentMax = Math.max(originalWidth, originalHeight);
                if (currentMax !== MAX_DIMENSION) { // Only scale if not already at the limit
                    const scaleFactor = MAX_DIMENSION / currentMax;
                    originalWidth = Math.round(originalWidth * scaleFactor);
                    originalHeight = Math.round(originalHeight * scaleFactor);
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let canvasWidth, canvasHeight;
                if (originalWidth / originalHeight > targetAspectRatio) {
                    canvasHeight = originalHeight;
                    canvasWidth = Math.round(canvasHeight * targetAspectRatio);
                } else {
                    canvasWidth = originalWidth;
                    canvasHeight = Math.round(canvasWidth / targetAspectRatio);
                }

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Apply watermark if selected
                if (watermarkFile) {
                    const watermarkReader = new FileReader();
                    watermarkReader.onload = (e) => {
                        const watermarkImg = new Image();
                        watermarkImg.onload = () => {
                            let watermarkAlpha;
                            switch (watermarkTransparency) {
                                case 'low': watermarkAlpha = 0.3; break; // Mucha transparencia (menos visible)
                                case 'medium': watermarkAlpha = 0.5; break;
                                case 'high': watermarkAlpha = 0.7; break; // Poca transparencia (más visible)
                                case 'opaque': watermarkAlpha = 1.0; break; // Totalmente visible
                                default: watermarkAlpha = 0.5; break;
                            }
                            ctx.globalAlpha = watermarkAlpha;

                            // Calculate watermark size to fit within canvas without stretching
                            let wmWidth = watermarkImg.width;
                            let wmHeight = watermarkImg.height;

                            const maxWmWidth = canvas.width * 0.3; // Max 30% of canvas width
                            const maxWmHeight = canvas.height * 0.3; // Max 30% of canvas height

                            if (wmWidth > maxWmWidth || wmHeight > maxWmHeight) {
                                const ratio = Math.min(maxWmWidth / wmWidth, maxWmHeight / wmHeight);
                                wmWidth *= ratio;
                                wmHeight *= ratio;
                            }

                            let wmX, wmY;
                            const padding = 20; // Padding from edges

                            switch (watermarkPosition) {
                                case 'top-right':
                                    wmX = canvas.width - wmWidth - padding;
                                    wmY = padding;
                                    break;
                                case 'top-left':
                                    wmX = padding;
                                    wmY = padding;
                                    break;
                                case 'bottom-right':
                                    wmX = canvas.width - wmWidth - padding;
                                    wmY = canvas.height - wmHeight - padding;
                                    break;
                                case 'bottom-left':
                                    wmX = padding;
                                    wmY = canvas.height - wmHeight - padding;
                                    break;
                                default:
                                    wmX = (canvas.width - wmWidth) / 2;
                                    wmY = (canvas.height - wmHeight) / 2;
                                    break;
                            }

                            ctx.drawImage(watermarkImg, wmX, wmY, wmWidth, wmHeight);
                            ctx.globalAlpha = 1.0; // Reset alpha

                            finalizeImage();
                        };
                        watermarkImg.src = e.target.result;
                    };
                    watermarkReader.readAsDataURL(watermarkFile);
                } else {
                    finalizeImage();
                }

                function finalizeImage() {
                    let quality;
                    switch (optimization) {
                        case 'high': quality = 0.5; break;
                        case 'medium': quality = 0.7; break;
                        default: quality = 1.0; break;
                    }

                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    imagePreview.innerHTML = `<img src="${dataUrl}" alt="Converted Image">`;
                    resolutionInfo.textContent = `${getTranslation('common.resolution')}: ${canvas.width}x${canvas.height}`;
                    sizeInfo.textContent = `${getTranslation('common.size')}: ${formatBytes(dataUrl.length)}`;

                    downloadLink.href = dataUrl;
                    downloadLink.download = `vrct_${file.name.split('.')[0]}.jpg`;
                    downloadLink.style.display = 'inline-block';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};