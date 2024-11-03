export class ImageProcessService {
    private readonly MAX_CHUNK_SIZE = 1024 * 1024; // 1MB
    private readonly MAX_DIMENSION = 1920;
    private readonly COMPRESSION_QUALITY = 0.8;

    async processImage(file: File): Promise<{
        compressedFile: File;
        thumbnail: string;
        chunks: string[];
    }> {
        // 压缩图片
        const compressedFile = await this.compressImage(file);

        // 生成缩略图
        const thumbnail = await this.generateThumbnail(compressedFile);

        // 分片处理
        const chunks = await this.chunkImage(compressedFile);

        return {
            compressedFile,
            thumbnail,
            chunks
        };
    }

    private async compressImage(file: File): Promise<File> {
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // 计算压缩后的尺寸
        let { width, height } = img;
        if (width > this.MAX_DIMENSION || height > this.MAX_DIMENSION) {
            if (width > height) {
                height = Math.round((height * this.MAX_DIMENSION) / width);
                width = this.MAX_DIMENSION;
            } else {
                width = Math.round((width * this.MAX_DIMENSION) / height);
                height = this.MAX_DIMENSION;
            }
        }

        // 使用 OffscreenCanvas 优化性能
        const offscreen = new OffscreenCanvas(width, height);
        const offscreenCtx = offscreen.getContext('2d')!;

        // 绘制图片
        offscreenCtx.drawImage(img, 0, 0, width, height);

        // 转换为 Blob
        const blob = await offscreen.convertToBlob({
            type: file.type,
            quality: this.COMPRESSION_QUALITY
        });

        return new File([blob], file.name, { type: file.type });
    }

    public async generateThumbnail(file: File): Promise<string> {
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // 设置缩略图尺寸
        const maxThumbSize = 400;
        let { width, height } = img;
        if (width > maxThumbSize || height > maxThumbSize) {
            if (width > height) {
                height = Math.round((height * maxThumbSize) / width);
                width = maxThumbSize;
            } else {
                width = Math.round((width * maxThumbSize) / height);
                height = maxThumbSize;
            }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        return canvas.toDataURL('image/jpeg', 0.7);
    }

    private async chunkImage(file: File): Promise<string[]> {
        const chunks: string[] = [];
        const totalChunks = Math.ceil(file.size / this.MAX_CHUNK_SIZE);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * this.MAX_CHUNK_SIZE;
            const end = Math.min(start + this.MAX_CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);
            const base64Chunk = await this.blobToBase64(chunk);
            chunks.push(base64Chunk);
        }

        return chunks;
    }

    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
} 