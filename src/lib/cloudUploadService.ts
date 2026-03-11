// cloudUploadService.ts - copied and slightly trimmed from amateur_player project

export interface UploadCallbacks {
    onProgress?: (progress: number) => void;
    onSpeed?: (speed: string) => void;
    onStatusChange?: (status: 'idle' | 'initiating' | 'uploading' | 'saving' | 'success' | 'error' | 'aborted') => void;
    onError?: (error: string) => void;
    onSuccess?: (publicUrl: string, key: string) => void;
}

export interface UploadResult {
    success: boolean;
    publicUrl?: string;
    key?: string;
    error?: string;
    aborted?: boolean;
}

export interface UploadOptions {
    fileName?: string;
    customHeaders?: Record<string, string>;
    useAuth?: boolean;
}

export class CloudUploadService {
    private abortController: AbortController | null = null;
    private uploadInfo: { key: string; publicUrl: string } | null = null;
    private callbacks: UploadCallbacks = {};

    async uploadFile(
        file: File,
        bucketName: string,
        callbacks?: UploadCallbacks,
        options?: UploadOptions
    ): Promise<UploadResult> {
        this.callbacks = callbacks || {};
        this.abortController = new AbortController();

        try {
            if (!file) {
                throw new Error('No file provided');
            }
            this.updateStatus('initiating');
            const { key, publicUrl, presignedUrl } = await this.initiateUpload(
                file,
                bucketName,
                options
            );
            this.uploadInfo = { key, publicUrl };
            this.updateStatus('uploading');
            await this.uploadWithProgress(file, presignedUrl);
            this.updateStatus('success');
            this.callbacks.onSuccess?.(publicUrl, key);
            return { success: true, publicUrl, key };
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                this.updateStatus('aborted');
                return { success: false, error: 'Upload cancelled by user', aborted: true };
            }
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            this.updateStatus('error');
            this.callbacks.onError?.(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            this.cleanup();
        }
    }

    async abort(): Promise<void> {
        if (!this.abortController) return;
        this.abortController.abort();
        if (this.uploadInfo) {
            try {
                const token = localStorage.getItem('access_token');
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                await fetch('/api/cloud/upload/singlepart/requests/abort', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        bucket: 'cdn',
                        params: { key: this.uploadInfo.key }
                    })
                });
            } catch (error) {
                console.error('[CloudUploadService] Failed to abort upload on server:', error);
            }
        }
    }

    isUploading(): boolean {
        return this.abortController !== null;
    }

    private async initiateUpload(
        file: File,
        bucketName: string,
        options?: UploadOptions
    ): Promise<{ key: string; publicUrl: string; presignedUrl: string }> {
        const useAuth = options?.useAuth !== false;
        const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options?.customHeaders };
        if (useAuth) {
            const token = localStorage.getItem('access_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        const fileName = options?.fileName || file.name;
        const response = await fetch('/api/cloud/upload/singlepart/requests/initiate', {
            method: 'POST',
            headers,
            body: JSON.stringify({ bucket: bucketName, file_name: fileName }),
            signal: this.abortController!.signal
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0] || `Failed to initiate upload: ${response.statusText}`);
        }
        const data = await response.json();
        return { key: data.key, publicUrl: data.public_url, presignedUrl: data.presigned_url };
    }

    private uploadWithProgress(file: File, presignedUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let lastLoaded = 0;
            let lastTime = Date.now();
            let currentLoaded = 0;
            let speedInt: NodeJS.Timeout | null = null;
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    currentLoaded = e.loaded;
                    const pct = Math.round((e.loaded / e.total) * 100);
                    this.callbacks.onProgress?.(pct);
                }
            });
            speedInt = setInterval(() => {
                const now = Date.now();
                const dt = (now - lastTime) / 1000;
                const bytes = Math.max(0, currentLoaded - lastLoaded);
                const speed = this.formatSpeed(bytes / Math.max(dt,1));
                this.callbacks.onSpeed?.(speed);
                lastLoaded = currentLoaded;
                lastTime = now;
            },1000);
            xhr.addEventListener('load', () => {
                if (speedInt) clearInterval(speedInt);
                if (xhr.status>=200 && xhr.status<300) resolve();
                else reject(new Error(`Upload failed with status ${xhr.status}`));
            });
            xhr.addEventListener('error', () => { if (speedInt) clearInterval(speedInt); reject(new Error('Network error')); });
            xhr.addEventListener('abort', () => { if (speedInt) clearInterval(speedInt); reject(new Error('Upload aborted')); });
            const abortHandler = () => { if (speedInt) clearInterval(speedInt); xhr.abort(); };
            this.abortController?.signal.addEventListener('abort', abortHandler);
            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
            xhr.send(file);
        });
    }

    private formatSpeed(bytesPerSecond: number): string {
        const bits = bytesPerSecond*8;
        if(bits>=1e9) return (bits/1e9).toFixed(2)+' Gbps';
        if(bits>=1e6) return (bits/1e6).toFixed(2)+' Mbps';
        if(bits>=1e3) return (bits/1e3).toFixed(2)+' Kbps';
        return Math.round(bits)+' bps';
    }

    private updateStatus(status: 'idle'|'initiating'|'uploading'|'saving'|'success'|'error'|'aborted'){
        this.callbacks.onStatusChange?.(status);
    }
    private cleanup(){ this.abortController=null; this.uploadInfo=null; }
}

export const cloudUploadService = new CloudUploadService();
export async function uploadFileToCloud(file: File,bucketName='cdn',callbacks?:UploadCallbacks,options?:UploadOptions):Promise<UploadResult>{
    const svc=new CloudUploadService();
    return svc.uploadFile(file,bucketName,callbacks,options);
}
