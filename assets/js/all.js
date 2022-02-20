"use strict";

var baseUrl = 'https://vue3-course-api.hexschool.io/v2';
var API_PATH = 'sylviah';
var AUTH_TOKEN = document.cookie.replace(/(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
"use strict";

var app = {
  data: function data() {
    return {
      userInfo: {
        username: '',
        password: ''
      }
    };
  },
  methods: {
    loginIn: function loginIn() {
      axios.post("".concat(baseUrl, "/admin/signin"), this.userInfo).then(function (res) {
        var _res$data = res.data,
            token = _res$data.token,
            expired = _res$data.expired; // 用 cookie 儲存資料，myToken 是自定義名稱

        document.cookie = "myToken=".concat(token, "; expires=").concat(new Date(expired), ";");
        window.location = './backend.html';
      })["catch"](function (err) {
        console.log(err.response);
        var errTitle = err.response.data.message;
        var errMSG = err.response.data.error.message; //登入失敗，sweetalert 跳出提示訊息視窗

        swal("".concat(errTitle, "\uFF01"), errMSG, {
          icon: "error"
        });
      });
    }
  }
}; // 建立實體、掛載

Vue.createApp(app).mount('#app');
"use strict";

// 元件 - 後臺產品列表分頁元件
var pagination_products = {
  props: ['pagination'],
  template: '#pagination-template'
}; // 元件 - Modal 編輯產品樣板

var modal_edit = {
  data: function data() {
    return {
      is_uploadImg: 0,
      uploadImgFile: {
        imageUrl: '',
        message: ''
      }
    };
  },
  props: ['tempItemInfo', 'is_addNewProduct'],
  template: '#edit-modal-template',
  methods: {
    uploadProductImg: function uploadProductImg() {
      var _this = this;

      // 圖片上傳中
      this.is_uploadImg = 1; //清空預設

      this.uploadImgFile = {
        imageUrl: '',
        message: ''
      };
      var btn_uploadImg = document.querySelector('#btn_uploadImg');
      var file = btn_uploadImg.files[0];
      console.dir(file); // 先對 input 內容進行觀察

      var formData = new FormData(); //建立表單格式的物件
      // 對應平台 API 格式：<input type="file" name="file-to-upload">

      formData.append('file-to-upload', file);
      axios.post("".concat(baseUrl, "/api/").concat(API_PATH, "/admin/upload"), formData).then(function (res) {
        console.log(res.data.imageUrl);
        _this.uploadImgFile.imageUrl = res.data.imageUrl; // 圖片上傳完成

        _this.is_uploadImg = 0; // 清空上傳檔案

        btn_uploadImg.value = '';
      })["catch"](function (err) {
        console.log(err.response.message);
        _this.uploadImgFile.message = err.response.message; // 圖片上傳失敗，重設狀態

        _this.is_uploadImg = 0;
      });
    }
  }
}; // 元件 - Modal 刪除產品樣板

var modal_del = {
  props: ['tempItemInfo'],
  template: '#del-modal-template'
};
"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var editModal = '';
var delModal = '';
var app2 = Vue.createApp({
  data: function data() {
    return {
      products: [],
      pagination: {},
      tempItemInfo: {
        imagesUrl: []
      },
      // 是否新增新產品，預設狀態:"0-否"
      is_addNewProduct: 0
    };
  },
  components: {
    pagination_products: pagination_products,
    modal_edit: modal_edit,
    modal_del: modal_del
  },
  methods: {
    checkLogin: function checkLogin() {
      var _this = this;

      AUTH_TOKEN = document.cookie.replace(/(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
      axios.post("".concat(baseUrl, "/api/user/check")).then(function () {
        _this.getProducts();
      })["catch"](function (err) {
        console.log(err.response);
        window.location = './index.html';
      });
    },
    getProducts: function getProducts() {
      var _this2 = this;

      var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      axios.get("".concat(baseUrl, "/api/").concat(API_PATH, "/admin/products?page=").concat(page)).then(function (res) {
        console.log(res.data.products);
        _this2.products = res.data.products;
        _this2.pagination = res.data.pagination;
      })["catch"](function (err) {
        console.log(err.response);
      });
    },
    changeStatus: function changeStatus(id) {
      var _this3 = this;

      this.products.forEach(function (item) {
        if (item.id === id) {
          item.is_enabled ? item.is_enabled = 0 : item.is_enabled = 1;
          console.log(item);

          _this3.editProduct(item, id);
        }
      });
    },
    editProduct: function editProduct(item, id) {
      var _this4 = this;

      if (item) {
        this.tempItemInfo = item;
      }

      var dataObj = {
        "data": this.tempItemInfo
      };
      var httpStatus = '';
      var url = '';

      if (this.is_addNewProduct) {
        httpStatus = 'post';
        url = "".concat(baseUrl, "/api/").concat(API_PATH, "/admin/product");
      } else {
        httpStatus = 'put';
        url = "".concat(baseUrl, "/api/").concat(API_PATH, "/admin/product/").concat(this.tempItemInfo.id || id);
      }

      axios[httpStatus](url, dataObj).then(function (res) {
        console.log(res.data);

        if (httpStatus === 'post') {
          //成功新增產品，sweetalert 跳出提示訊息視窗
          swal('成功！', "\u6210\u529F\u65B0\u589E ".concat(_this4.tempItemInfo.title), {
            icon: "success"
          });
        } else {
          //成功更新產品，sweetalert 跳出提示訊息視窗
          swal('成功！', "\u5DF2\u66F4\u65B0 ".concat(_this4.tempItemInfo.title, " \u7684\u8CC7\u8A0A"), {
            icon: "success"
          });
        }

        _this4.getProducts(_this4.pagination.current_page);
      })["catch"](function (err) {
        console.log(err.response);
        var errMSG = err.response.data.message;
        var msg = '';
        errMSG.forEach(function (el) {
          return msg += el + '。\n';
        }); //更新失敗，sweetalert 跳出提示訊息視窗

        swal('失敗！請重新輸入資訊。', msg, {
          icon: "error"
        });
      }); // 清空上傳圖片區

      this.uploadImgFile = {
        imageUrl: '',
        message: ''
      }; // 關閉 modal

      editModal.hide();
    },
    openEditModal: function openEditModal(is_addNewProduct, item) {
      this.is_addNewProduct = is_addNewProduct;
      this.tempItemInfo = {
        imagesUrl: []
      };

      if (item) {
        this.tempItemInfo = _objectSpread({}, item);
      }

      editModal.show();
    },
    openDelModal: function openDelModal(item) {
      this.tempItemInfo = _objectSpread({}, item);
      delModal.show();
    },
    copyText: function copyText() {
      var clipboard = new ClipboardJS('#btn_copyLink');
      clipboard.on('success', function (e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger);
        e.clearSelection(); //取消選取
      });
      clipboard.on('error', function (e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
      });
    },
    delProduct: function delProduct() {
      var _this5 = this;

      var dataID = this.tempItemInfo.id;
      axios["delete"]("".concat(baseUrl, "/api/").concat(API_PATH, "/admin/product/").concat(dataID)).then(function (res) {
        //成功刪除產品，sweetalert 跳出提示訊息視窗
        swal('成功！', "\u5DF2\u522A\u9664 ".concat(_this5.tempItemInfo.title, " \u7684\u8CC7\u8A0A"), {
          icon: "success"
        });

        _this5.getProducts(_this5.pagination.current_page);
      })["catch"](function (err) {
        console.log(err.response); //刪除失敗，sweetalert 跳出提示訊息視窗

        swal('失敗！', '請再試一次', {
          icon: "error"
        });
      });
      delModal.hide();
    }
  },
  mounted: function mounted() {
    this.checkLogin();
    editModal = new bootstrap.Modal(document.querySelector('#productModal'));
    delModal = new bootstrap.Modal(document.querySelector('#delProductModal'));
  }
});
app2.mount('#app2');
//# sourceMappingURL=all.js.map
