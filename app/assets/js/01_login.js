const app = {
    data() {
        return {
            userInfo:{
                username: '',
                password: ''
            }
        }
    },
    methods:{
        loginIn(){
            axios.post(`${baseUrl}/admin/signin`, this.userInfo)
            .then(res => {
                const { token, expired } = res.data;
                // 用 cookie 儲存資料，myToken 是自定義名稱
                document.cookie = `myToken=${ token }; expires=${new Date(expired)};`;
                window.location = './backend.html';
            })
            .catch(err => {
                console.log(err.response);
                const errTitle = err.response.data.message;
                const errMSG = err.response.data.error.message;
                //登入失敗，sweetalert 跳出提示訊息視窗
                swal(`${errTitle}！`, errMSG, {
                    icon: "error",
                });
            })
        }
    }
};

// 建立實體、掛載
Vue.createApp(app).mount('#app');
