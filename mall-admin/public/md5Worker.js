// MD5计算Worker脚本
// 导入SparkMD5库
self.importScripts('./spark-md5.min.js');

// 监听主线程消息
self.onmessage = function (e) {
    const { file, chunkSize } = e.data;
    calculateMD5(file, chunkSize);
};

/**
 * 在Worker中计算文件MD5哈希值
 * @param {File} file - 文件对象
 * @param {number} chunkSize - 分块大小
 */
function calculateMD5(file, chunkSize) {
    const chunks = Math.ceil(file.size / chunkSize);
    const spark = new self.SparkMD5.ArrayBuffer();
    let currentChunk = 0;

    // 使用FileReader读取文件块
    const fileReader = new FileReader();

    fileReader.onload = function (e) {
        // 将读取的块添加到哈希计算中
        spark.append(e.target.result);
        currentChunk++;

        // 报告进度给主线程
        self.postMessage({
            type: 'progress',
            data: {
                percent: Math.floor((currentChunk / chunks) * 100)
            }
        });

        if (currentChunk < chunks) {
            // 继续读取下一块
            loadNext();
        } else {
            // 计算完成，返回结果
            const hash = spark.end();
            self.postMessage({
                type: 'complete',
                data: { hash }
            });
        }
    };

    fileReader.onerror = function (error) {
        // 报告错误给主线程
        self.postMessage({
            type: 'error',
            data: { error: error.toString() }
        });
    };

    function loadNext() {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        fileReader.readAsArrayBuffer(chunk);
    }

    // 开始加载第一个块
    loadNext();
} 