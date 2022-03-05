// 元件 - 後臺產品列表分頁元件
const pagination_products = {
    props:['pagination'],
    template:'#pagination-template'
}

// 元件 - Modal 編輯產品樣板
const modal_edit = {
    data(){
        return{
            is_uploadImg:0,
            uploadImgFile:{
                imageUrl:'',
                message:''
            },
        }
    },
    props:['tempItemInfo','is_addNewProduct'],
    template:'#edit-modal-template',
    methods:{
        uploadProductImg(){
            // 圖片上傳中
            this.is_uploadImg = 1;

            //清空預設
            this.uploadImgFile = {
                imageUrl:'',
                message:''
            }

            const btn_uploadImg = document.querySelector('#btn_uploadImg');
            
            let file = btn_uploadImg.files[0];
            console.dir(file); // 先對 input 內容進行觀察
        
            const formData = new FormData(); //建立表單格式的物件
            // 對應平台 API 格式：<input type="file" name="file-to-upload">
            formData.append('file-to-upload', file);

            axios.post(`${baseUrl}/api/${API_PATH}/admin/upload`, formData)
            .then(res => {
                console.log(res.data.imageUrl);
                this.uploadImgFile.imageUrl = res.data.imageUrl;
                // 圖片上傳完成
                this.is_uploadImg = 0;
                // 清空上傳檔案
                btn_uploadImg.value = '';
            })
            .catch(err => {
                console.log(err.response.message);
                this.uploadImgFile.message = err.response.message;
                // 圖片上傳失敗，重設狀態
                this.is_uploadImg = 0;
            })
        },
        copyText(){
            const clipboard = new ClipboardJS('#btn_copyLink');
            
            clipboard.on('success', function(e) {
                console.info('Action:', e.action);
                console.info('Text:', e.text);
                console.info('Trigger:', e.trigger);
            
                e.clearSelection(); //取消選取
            });
            
            clipboard.on('error', function(e) {
                console.error('Action:', e.action);
                console.error('Trigger:', e.trigger);
            });
        },
    }
}

// 元件 - Modal 刪除產品樣板
const modal_del = {
    props:['tempItemInfo'],
    template:'#del-modal-template'
}
