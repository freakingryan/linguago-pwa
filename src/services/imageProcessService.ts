export class ImageProcessService {
    private readonly MAX_DIMENSION = 1920;
    private readonly COMPRESSION_QUALITY = 0.8;

    async processImage(file: File): Promise<{
        compressedFile: File;
        thumbnail: string;
    }> {
        // 压缩图片
        const compressedFile = await this.compressImage(file);
        // 生成缩略图
        const thumbnail = await this.generateThumbnail(compressedFile);

        return {
            compressedFile,
            thumbnail
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

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(
                (blob) => resolve(blob!),
                file.type,
                this.COMPRESSION_QUALITY
            );
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
} 