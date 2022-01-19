<template>
  <div id="haibaoPage">
    <div class="haibao">
      <div class="bg" id="bg"></div>
      <div class="search-wrap">
        <div class="search">
          <img src="../../assets/haibao/search.png" />
          <input
            type="search"
            v-model="keywordText"
            @keyup.enter="handleSearch()"
          />
        </div>
      </div>
      <div class="haibao-list">
        <div
          class="haibao"
          v-for="(item, index) in haibaoList"
          v-bind:key="index"
        >
          <img
            @click="imagePreviewClick(item.originUrl)"
            class="img"
            :src="item.img"
          />
          <div class="content">
            <div class="row1">
              <div class="name">{{ item.name }}</div>
              <div
                class="like"
                v-on:click="likeClick(item)"
                :class="{ isLike: item.isLike }"
              >
                <img
                  class="img"
                  v-if="!item.isLike"
                  src="../../assets/haibao/heart2.png"
                />
                <img
                  class="img"
                  v-if="item.isLike"
                  src="../../assets/haibao/heart.png"
                />
              </div>
            </div>
            <div class="row2">
              <div class="depart">{{ item.depart }}</div>
              <div class="likeNum" :class="{ isLike: item.isLike }">
                {{ item.likeNum }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="btn-wrap">
        <div v-on:click="btnOpenModal" class="btn">我的海报</div>
      </div>
    </div>
    <div class="modal" v-show="modalShow">
      <div class="dialog">
        <div class="input-dialog" v-show="!haveUpload">
          <div class="title">部门</div>
          <div class="wrap">
            <select
              v-model="form.Company"
              @change="departChange($event)"
              class="select"
            >
              <option
                v-bind:key="index"
                v-for="(item, index) in departOptions"
                :value="item.value"
              >
                {{ item.name }}
              </option>
            </select>
          </div>
          <div class="title">姓名</div>
          <div class="wrap">
            <input
              placeholder="请填写您的姓名"
              v-model="form.Name"
              type="text"
              class="name"
            />
          </div>
          <div class="title">上传海报</div>
          <div class="wrap2">
            <div v-show="hasUpload" class="upload-img" v-on:click="uploadClick">
              <img :src="uploadImg" />
            </div>
            <div
              v-show="!hasUpload"
              class="upload-area"
              v-on:click="uploadClick"
            >
              <img src="../../assets/haibao/add.png" />
            </div>
            <input
              style="display: none"
              ref="inputFile"
              type="file"
              accept="image/*"
            />
          </div>
          <div class="btn-wrap">
            <div class="btn" v-on:click="save">
              <div class="txt">提交</div>
            </div>
          </div>
        </div>
        <div class="haveImg" v-show="haveUpload">
          <img :src="myPoster" />
          <div class="btn-wrap">
            <div class="btn" v-on:click="closeBtn">
              <div class="txt">关闭</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import departs from "./depart.json";
import ajax from "../../core/ajax";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default {
  name: "App",
  data() {
    return {
      myPoster: "",
      haveUpload: false,
      keywordText: "",
      haibaoList: [],
      originList: [],
      modalShow: false,
      form: {
        Company: "",
        Name: "",
        ImageUrl: "",
      },
      uploadImg: "",
      uploadFile: null,
      departOptions: [],
      hasUpload: false,
      defaultHost: "http://zfsc-poster.oss-cn-beijing.aliyuncs.com/",
      ossConfig: {
        accessid: "",
        policy: "",
        signature: "",
        dir: "",
        host: "",
      },
    };
  },
  components: {},
  created() {
    document.title = "外服工会征集最美海报";
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.initPhoneId();
      this.getList();
      this.initDeparts();
      this.getStatusByPhone();
    },
    //初始化浏览器唯一编码
    initPhoneId() {
      const phone_uuid = localStorage.getItem("phone_uuid");
      if (!phone_uuid) {
        const uuid = uuidv4();
        localStorage.setItem("phone_uuid", uuid);
      }
    },
    initOss() {
      ajax
        .get("/Poster/GetPolicyToken")
        .then((res) => {
          const data = res.data;
          if (data.Code === 1) {
            const tempJson = JSON.parse(data.Msg);
            this.ossConfig = { ...tempJson };
            console.log("this.ossConfig", this.ossConfig);
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    initHeight() {},
    initDeparts() {
      if (Array.isArray(departs)) {
        departs.forEach((item) => {
          this.departOptions.push({
            name: item,
            value: item,
          });
        });
      }
    },
    initFileChange() {
      this.$refs.inputFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        this.uploadFile = file;
        let re = new FileReader();
        re.readAsDataURL(file);
        re.onload = (result) => {
          this.uploadImg = result.target.result;
          this.hasUpload = true;
        };
      });
    },
    getStatusByPhone() {
      const phone = localStorage.getItem("phone_uuid");

      const form = new FormData();
      form.set("Phone", phone);

      ajax
        .post("/Poster/GetStatusByPhone", form)
        .then((res) => {
          const data = res.data;
          if (data.Code === 1) {
            if (data.Status === 1) {
              this.haveUpload = true;
              this.GetPosterModel();
            }
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    btnOpenModal() {
      this.modalShow = true;
      this.initOss();
      this.initFileChange();
    },
    departChange(event) {
      this.form.Company = event.target.value;
    },
    uploadClick() {
      this.$refs.inputFile.click();
    },
    likeClick(item) {
      const fromPhone = localStorage.getItem("phone_uuid");
      const toPhone = item.Phone;
      const form = new FormData();
      form.set("FromPhone", fromPhone);
      form.set("ToPhone", toPhone);

      ajax
        .post("/Poster/PosterDoTouPiao", form)
        .then((res) => {
          const data = res.data;
          if (data.Code === 1) {
            item.isLike = true;
            item.Total = item.Total + 1;
            alert(data.Msg);
          } else {
            alert(data.Msg);
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    GetPosterModel() {
      const phone_uuid = localStorage.getItem("phone_uuid");
      const form = new FormData();
      form.set("Phone", phone_uuid);

      ajax
        .post("/Poster/GetPosterModel", form)
        .then((res) => {
          const data = res.data;
          if (data.Code == 1) {
            this.myPoster = this.defaultHost + data.Url;
          } else {
            //alert("data", data.Msg);
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    imagePreviewClick(url) {
      this.$hevueImgPreview(url);
    },
    getList() {
      ajax
        .get("/Poster/GetPosterAndTotal")
        .then((res) => {
          const data = res.data;
          const lists = data.datas;
          if (Array.isArray(lists)) {
            lists.forEach((item) => {
              let tempUrl = "";
              let originUrl = "";
              if (item.Url) {
                tempUrl =
                  this.defaultHost +
                  item.Url +
                  "?x-oss-process=image/resize,m_fill,h_368,w_340";
                originUrl = this.defaultHost + item.Url;
              }
              this.haibaoList.push({
                img: tempUrl,
                originUrl: originUrl,
                name: item.Name,
                depart: item.Company,
                isLike: false,
                likeNum: item.Total,
                Phone: item.Phone,
              });
            });
            this.originList = JSON.parse(JSON.stringify(this.haibaoList));
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    async save() {
      if (!this.form.Company) {
        alert("请选择部门");
        return false;
      }
      if (!this.form.Name) {
        alert("请填写姓名");
        return false;
      }
      if (this.uploadFile == null) {
        alert("请上传海报");
        return false;
      }
      //先上传图片看看ok不ok
      const filekey = await this.uploadHttp(this.uploadFile);
      const phone = localStorage.getItem("phone_uuid");

      const form = new FormData();
      form.set("Company", this.form.Company);
      form.set("Name", this.form.Name);
      form.set("Phone", phone);
      form.set("UrlStr", filekey);

      ajax
        .post("/Poster/UpdatePoster", form)
        .then((res) => {
          console.log("res", res);
          const data = res.data;
          if (data.Code === 1) {
            if (data.Status === 1) {
              this.getList();
            }
            localStorage.setItem("xh", data.Xh);
            this.modalShow = false;
          } else {
            alert("data", data.Msg);
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    async uploadHttp(file) {
      const filekey = "haibao/" + uuidv4();
      const formData = new FormData();
      formData.append("signature", this.ossConfig.signature || "");
      formData.append("OSSAccessKeyId", this.ossConfig.accessid || "");
      formData.append("policy", this.ossConfig.policy || "");
      formData.append("key", filekey);
      formData.append("file", file);
      const res = await axios({
        url: "http://" + this.ossConfig.host,
        method: "POST",
        data: formData,
      });

      if (res.status === 204) {
        return filekey;
      } else {
        throw new Error("错误");
      }
    },
    modalClose() {
      this.modalShow = false;
    },
    handleSearch() {
      const searchText = this.keywordText;
      console.log("searchText", searchText);
      const lists = this.originList;
      const filterItems = (query) => {
        return lists.filter((el) => {
          console.log("el", el);
          return el.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
        });
      };
      this.haibaoList = filterItems(searchText);
    },
    closeBtn() {
      this.modalShow = false;
    },
  },
};
</script>

<style lang="less" scoped>
.haibao {
  position: relative;
  .bg {
    background: url("../../assets/haibao/bg.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
  }
  .search-wrap {
    margin-top: 390px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    .search {
      width: 700px;
      height: 70px;
      background: #ffffff;
      opacity: 1;
      border-radius: 40px;
      display: flex;
      align-items: center;
      img {
        width: 36px;
        height: 36px;
        margin-left: 40px;
      }
      input {
        margin-left: 20px;
        width: 500px;
        height: 50px;
        border: 0; // 去除未选中状态边框
        outline: none; // 去除选中状态边框
      }
    }
  }
  .haibao-list {
    display: flex;
    padding: 0px 24px;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 24px;
    height: calc(100vh - 680px);
    overflow-y: scroll;
    padding-bottom: 30px;
    .haibao {
      width: 340px;
      height: 500px;
      border-radius: 24px;
      overflow: hidden;
      margin-bottom: 22px;
      display: flex;
      flex-direction: column;
      .img {
        width: 340px;
        height: 368px;
      }
      .content {
        height: 132px;
        background-color: #ffffff;
        .row1 {
          display: flex;
          margin: 0px 24px;
          justify-content: space-between;
          margin-top: 20px;
          .name {
            font-size: 30px;
            font-weight: bold;
            line-height: 42px;
            color: #222222;
          }
          .like {
            .img {
              width: 40px;
              height: 36px;
            }
          }
        }
        .row2 {
          display: flex;
          padding-top: 10px;
          margin: 0px 24px;
          justify-content: space-between;
          align-items: center;
          .depart {
            font-size: 24px;
            font-weight: 400;
            line-height: 34px;
            color: #999999;
          }
          .likeNum {
            font-size: 24px;
            font-family: PingFang SC;
            font-weight: 400;
            line-height: 34px;
            color: #999999;
            margin-right: 13px;
          }
        }
      }
    }
  }
  .btn-wrap {
    display: flex;
    justify-content: center;
    align-content: center;
    position: relative;
    margin-top: 26px;
    .btn {
      width: 520px;
      height: 90px;
      background: #fff;
      box-shadow: 0px 8px 20px #c35901;
      opacity: 1;
      border-radius: 200px;
      text-align: center;
      font-size: 40px;
      font-weight: bold;
      line-height: 90px;
      color: #222222;
      opacity: 1;
    }
  }
}
.modal {
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  opacity: 1;
  .dialog {
    margin-top: 100px;
    width: 640px;
    height: 780px;
    background: #ffffff;
    opacity: 1;
    border-radius: 24px;
    padding-top: 40px;
    .input-dialog {
      .wrap {
        margin-top: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .wrap2 {
        margin-top: 16px;
        display: flex;
      }
      .upload-img {
        margin-left: 44px;
        width: 180px;
        height: 180px;
        border-radius: 20px;
        overflow: hidden;
        img {
          width: 180px;
          height: 180px;
        }
      }
      .upload-area {
        margin-left: 44px;
        width: 180px;
        height: 180px;
        background: rgba(244, 244, 244, 0.39);
        border: 1px solid #707070;
        opacity: 1;
        border-radius: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
          width: 92px;
          height: 92px;
        }
      }

      .title {
        padding-left: 60px;
        margin-top: 20px;
        font-size: 30px;
        font-family: PingFang SC;
        font-weight: 400;
        line-height: 42px;
        color: #0f1628;
      }
      .select {
        width: 580px;
        height: 70px;
        background: #f4f4f4;
        border: 1px solid #707070;
      }
      .name {
        width: 540px;
        height: 70px;
        background: #f4f4f4;
        border: 1px solid #707070;
      }
      .mubiao {
        width: 540px;
        height: 232px;
        background: #f4f4f4;
        border: 1px solid #707070;
      }
      .btn-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        .btn {
          margin-top: 50px;
          width: 560px;
          height: 90px;
          background: #c35901;
          opacity: 1;
          border-radius: 200px;
          display: flex;
          justify-content: center;
          align-items: center;
          .txt {
            font-size: 36px;
            font-family: PingFang SC;
            font-weight: bold;
            line-height: 50px;
            color: #ffffff;
          }
        }
      }
    }
    .haveImg {
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      img {
        width: 560px;
        height: 610px;
      }
      .btn-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        .btn {
          margin-top: 50px;
          width: 560px;
          height: 90px;
          background: #c35901;
          opacity: 1;
          border-radius: 200px;
          display: flex;
          justify-content: center;
          align-items: center;
          .txt {
            font-size: 36px;
            font-family: PingFang SC;
            font-weight: bold;
            line-height: 50px;
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>