let editModal = '';
let delModal = '';

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
            this.is_addNewProduct = 0;
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
                this.tempItemInfo = JSON.parse(JSON.stringify(item));

                if(!this.tempItemInfo.imagesUrl) {
                    this.tempItemInfo.imagesUrl = [];
                }
            }
        
            editModal.show();

        },
        openDelModal(item){
            this.tempItemInfo = {
                ...item
            }
        
            delModal.show();

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
