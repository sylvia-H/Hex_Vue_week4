let editModal = '';
let delModal = '';

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
    }
}

// 元件 - Modal 刪除產品樣板
const modal_del = {
    props:['tempItemInfo'],
    template:'#del-modal-template'
}


const app2 = Vue.createApp({
    data() {
        return {
            products : [],
            pagination:{},
            tempItemInfo:{
                imagesUrl:[]
            },
            // 是否新增新產品，預設狀態:"0-否"
            is_addNewProduct:0,
        }
    },
    components:{
        pagination_products,
        modal_edit,
        modal_del,
    },
    methods:{
        checkLogin(){
            AUTH_TOKEN = document.cookie.replace(/(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
            axios.post(`${baseUrl}/api/user/check`)
            .then(() => {
                this.getProducts();
            })
            .catch(err => {
                console.log(err.response);
                window.location = './index.html';
            })
        },
        getProducts(page = 1){
            axios.get(`${baseUrl}/api/${API_PATH}/admin/products?page=${page}`)
            .then(res => {
                console.log(res.data.products);
                this.products = res.data.products;
                this.pagination = res.data.pagination;
            })
            .catch(err => {
                console.log(err.response);
            })
        },
        changeStatus(id){
            this.products.forEach(item => {
                if(item.id === id){
                    item.is_enabled ? item.is_enabled = 0 : item.is_enabled = 1;
                    console.log(item);
                    this.editProduct(item,id);
                }
            });
        },
        editProduct(item,id){
            if(item) {
                this.tempItemInfo = item;
            }
            const dataObj = {
                "data": this.tempItemInfo
            };
            let httpStatus = '';
            let url = '';

            if(this.is_addNewProduct){
                httpStatus = 'post';
                url = `${baseUrl}/api/${API_PATH}/admin/product`;
            } else {
                httpStatus = 'put';
                url = `${baseUrl}/api/${API_PATH}/admin/product/${this.tempItemInfo.id || id}`;
            }

            axios[httpStatus](url, dataObj)
            .then(res => {
                console.log(res.data);
                if(httpStatus === 'post'){
                    //成功新增產品，sweetalert 跳出提示訊息視窗
                    swal('成功！', `成功新增 ${this.tempItemInfo.title}`, {
                        icon: "success",
                    });
                } else {
                    //成功更新產品，sweetalert 跳出提示訊息視窗
                    swal('成功！', `已更新 ${this.tempItemInfo.title} 的資訊`, {
                        icon: "success",
                    });
                }
                this.getProducts(this.pagination.current_page);
            })
            .catch(err => {
                console.log(err.response);
                const errMSG = err.response.data.message;
                let msg = '';
                errMSG.forEach(el => msg+=el+'。\n')
                //更新失敗，sweetalert 跳出提示訊息視窗
                swal('失敗！請重新輸入資訊。', msg, {
                    icon: "error",
                });
            });

            // 清空上傳圖片區
            this.uploadImgFile = {
                imageUrl:'',
                message:''
            }

            // 關閉 modal
            editModal.hide();

        },
        openEditModal(is_addNewProduct,item){
            this.is_addNewProduct = is_addNewProduct;
            this.tempItemInfo = {
                imagesUrl:[]
            }

            if(item) {
                this.tempItemInfo = {
                    ...item
                };
            }
        
            editModal.show();

        },
        openDelModal(item){
            this.tempItemInfo = {
                ...item
            }
        
            delModal.show();

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
        delProduct(){
            const dataID = this.tempItemInfo.id;
            axios.delete(`${baseUrl}/api/${API_PATH}/admin/product/${dataID}`)
            .then(res => {
                //成功刪除產品，sweetalert 跳出提示訊息視窗
                swal('成功！', `已刪除 ${this.tempItemInfo.title} 的資訊`, {
                    icon: "success",
                });
                this.getProducts(this.pagination.current_page);
            })
            .catch(err => {
                console.log(err.response);
                //刪除失敗，sweetalert 跳出提示訊息視窗
                swal('失敗！', '請再試一次', {
                    icon: "error",
                });
            });

            delModal.hide();
        }
    },
    mounted(){
        this.checkLogin();
        editModal = new bootstrap.Modal(document.querySelector('#productModal'));
        delModal = new bootstrap.Modal(document.querySelector('#delProductModal'));
    }
});

app2.mount('#app2');
