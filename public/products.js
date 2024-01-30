import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const api_url = "https://ec-course-api.hexschool.io/v2";
const api_path = "dollob_api";

// Modal
let productModal = null;
let delproductModal = null;

const app = createApp({
    data(){
    return{
        products: [],
        tempProduct : {
            imagesUrl: [],
        }, // 用於儲存 "查看細節" Data
        pagination: {},
        isNew: false,
        title: ""
    }
    },
    mounted(){
        productModal = new bootstrap.Modal(document.querySelector('#productModal'),{
            keyboard: false
        });

        delproductModal = new bootstrap.Modal(document.querySelector('#delProductModal'),{
            keyboard: false
        });

        // 取出 Token
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
        axios.defaults.headers.common.Authorization = token;

        this.checkAdmin();
    },
    methods:{
        checkAdmin(){
            const api = `${api_url}/api/user/check`;
            axios.post(api).then((res) => {
                this.getData()
            }).catch((err) => {
                alert(err.data.message);
                window.location = 'login.html';
            })
        },
        getData(page = 1){
            const api = `${api_url}/api/${api_path}/admin/products?page=${page}`;
            axios.get(api).then((res) => {
                const { products, pagination } = res.data;
                this.products = products;
                this.pagination = pagination;
            }).catch((err) => {
                alert(err.data.message);
            })
        },
        show_Model(flg, item){
            switch(flg){
                case 'new': 
                    this.isNew = true;
                    this.tempProduct = {
                        imagesUrl: [],
                    };
                    this.title = "新增";
                    productModal.show();
                    break;
                case 'edit': 
                    this.isNew = false;
                    this.tempProduct = { ...item };
                    this.ShowImagebtn(this.tempProduct);
                    this.title = "編輯";
                    productModal.show();
                    break;
                case 'delete': 
                    this.tempProduct = { ...item };
                    delproductModal.show();
                    break;
            }
        },
        Update_product(id){
            let api = '';
            if(this.isNew === true){
                api = `${api_url}/api/${api_path}/admin/product`;
                axios.post(api, { data: this.tempProduct }).then((res) => {
                    alert('新增產品成功!!!');
                    this.getData();
                    productModal.hide();
                }).catch((err) => {
                    alert(err.data.message);
                })
            }else{
                api = `${api_url}/api/${api_path}/admin/product/${id}`;
                axios.put(api, { data: this.tempProduct }).then((res) => {
                    alert('更新產品成功!!!');
                    this.getData();
                    productModal.hide();
                }).catch((err) => {
                    alert(err.data.message);
                })
            }
        },
        Delete_product(id){
            let api = '';
            api = `${api_url}/api/${api_path}/admin/product/${id}`;
            axios.delete(api).then((res) => {
                alert('刪除產品完成!!!');
                this.getData();
                delproductModal.hide();
            }).catch((err) => {
                alert(err.data.message);
            })
        },
        ShowImagebtn(tempProduct){
            if (!tempProduct.hasOwnProperty('imagesUrl') && !Array.isArray(tempProduct.imagesUrl)) {
                tempProduct.imagesUrl = [];
                tempProduct.imagesUrl.push('');
            }
            return true;
        }
    },
});

app.component('pagination', {
    template: '#pagination',
    props:['pagination'],
    methods:{
        changePage(page){
            this.$emit('changePage', page)
        }
    }
});

app.component('productModal', {
    template: '#productModal',
    props:['tempProduct', 'title'],
    methods:{
        update_product(id){
            this.$emit('update_product', id)
        },
        showImage(tempProduct){
            this.$emit('ShowImagebtn', tempProduct)
        }
    }
});

app.component('delProductModal', {
    template: '#delProductModal',
    props:['tempProduct'],
    methods:{
        delproduct(id){
            this.$emit('delproduct', id)
        }
    }
});

app.mount('#app');